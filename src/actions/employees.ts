'use server';

import { sendOnboardingInvite } from '@/lib/email/send-onboarding-invite';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import {
  contactInfoWithIdSchema,
  employeeIdField,
  employeeIdSchema,
  employmentConfigSchema,
  inviteEmployeeSchema,
} from '@/schema/employee';
import { bankInfoSchema, socialAccountsSchema } from '@/schema/onboarding';

// Defense in depth: RLS enforces the same thing.
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

export const inviteEmployee = authActionClient
  .schema(inviteEmployeeSchema)
  .action(async ({ parsedInput: { email, fullName }, ctx: { authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const name = fullName?.trim() || null;
    // Supabase auth lower-cases emails; match that so a case-only variant can't
    // create a second row for the same person.
    const normalizedEmail = email.trim().toLowerCase();

    // Must run before anything is created. `generateLink` returns the *existing*
    // auth user for a registered email rather than erroring, so without this the
    // insert below would hit a duplicate key and the compensating `deleteUser`
    // would cascade-delete this person's real employees row.
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('employees')
      .select('account_status')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (existingError) {
      throw new Error('Could not send the invitation. Please try again.');
    }
    if (existing) {
      throw new Error(
        existing.account_status === 'invited'
          ? 'This person has already been invited. Use Resend on their row to send a new link.'
          : 'An employee with this email already exists.',
      );
    }

    // `generateLink` creates the auth user without triggering Supabase's
    // unbrandable mailer, so we deliver our own template via Resend instead.
    const { data: invited, error: inviteError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: normalizedEmail,
        options: { data: name ? { full_name: name } : undefined },
      });
    // The raw auth error is not surfaced — the usual cause is an already
    // invited email.
    if (inviteError || !invited.user) {
      throw new Error('Could not send the invitation. Please try again.');
    }

    const inviteUrl = new URL(paths.auth.acceptInvitation, appConfig.appUrl);
    inviteUrl.searchParams.set('token_hash', invited.properties.hashed_token);
    inviteUrl.searchParams.set('type', 'invite');

    try {
      await sendOnboardingInvite({
        to: normalizedEmail,
        employeeName: name ?? '',
        onboardingLink: inviteUrl.toString(),
      });
    } catch {
      // The auth user exists but nobody can receive the link — roll back.
      await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
      throw new Error('Could not send the invitation. Please try again.');
    }

    const { error: rowError } = await supabaseAdmin.from('employees').insert({
      id: invited.user.id,
      email: normalizedEmail,
      full_name: name,
      role: 'employee',
      account_status: 'invited',
      invited_at: new Date().toISOString(),
    });
    if (rowError) {
      // 23505 means the auth user was pre-existing, not created by us, so
      // deleting it would cascade-delete a real employees row. Roll back only
      // when we are the ones who created it.
      if (rowError.code !== '23505') {
        await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
        throw new Error(
          'Could not create the employee record. Please try again.',
        );
      }
      throw new Error('An employee with this email already exists.');
    }

    return { id: invited.user.id };
  });

export const resendInvite = authActionClient
  .schema(employeeIdSchema)
  .action(async ({ parsedInput: { employeeId }, ctx: { authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: employee, error: readError } = await supabaseAdmin
      .from('employees')
      .select('email, full_name, account_status')
      .eq('id', employeeId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!employee) throw new Error('Employee not found.');
    if (employee.account_status !== 'invited') {
      throw new Error('This person has already accepted their invitation.');
    }

    const { data: link, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: employee.email,
      });
    if (linkError || !link.properties) {
      throw new Error('Could not resend the invitation. Please try again.');
    }

    const inviteUrl = new URL(paths.auth.acceptInvitation, appConfig.appUrl);
    inviteUrl.searchParams.set('token_hash', link.properties.hashed_token);
    inviteUrl.searchParams.set('type', 'magiclink');

    try {
      await sendOnboardingInvite({
        to: employee.email,
        employeeName: employee.full_name ?? '',
        onboardingLink: inviteUrl.toString(),
      });
    } catch {
      throw new Error('Could not resend the invitation. Please try again.');
    }

    // Re-stamp so the directory's "Invited" date reflects this send.
    await supabaseAdmin
      .from('employees')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', employeeId);
  });

export const cancelInvite = authActionClient
  .schema(employeeIdSchema)
  .action(async ({ parsedInput: { employeeId }, ctx: { authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: employee, error: readError } = await supabaseAdmin
      .from('employees')
      .select('account_status')
      .eq('id', employeeId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!employee) throw new Error('Employee not found.');
    if (employee.account_status !== 'invited') {
      throw new Error('Only a pending invitation can be cancelled.');
    }

    // The status guard makes this a no-op if the invite was accepted meanwhile,
    // rather than racing the auth-user deletion below.
    const { error: rowError } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', employeeId)
      .eq('account_status', 'invited');
    if (rowError) throw new Error(rowError.message);

    // Frees the email to be invited again.
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(employeeId);
    if (authError) throw new Error(authError.message);
  });

export const disableEmployee = authActionClient
  .schema(employeeIdSchema)
  .action(
    async ({ parsedInput: { employeeId }, ctx: { authUser, supabase } }) => {
      requireAdmin(authUser.user?.app_metadata.role);

      const { data: employee, error: readError } = await supabaseAdmin
        .from('employees')
        .select('role, account_status')
        .eq('id', employeeId)
        .maybeSingle();
      if (readError) throw new Error(readError.message);
      if (!employee) throw new Error('Employee not found.');
      if (employee.role !== 'employee') {
        throw new Error('Administrator accounts cannot be disabled here.');
      }
      if (employee.account_status === 'disabled') {
        throw new Error('This employee is already disabled.');
      }

      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(employeeId, {
          ban_duration: '876000h',
        });
      if (authError) throw new Error(authError.message);

      const { error: updateError } = await supabase.rpc('set_employee_access', {
        p_employee_id: employeeId,
        p_disabled: true,
      });
      if (updateError) {
        await supabaseAdmin.auth.admin.updateUserById(employeeId, {
          ban_duration: 'none',
        });
        throw new Error(updateError.message);
      }
    },
  );

export const enableEmployee = authActionClient
  .schema(employeeIdSchema)
  .action(
    async ({ parsedInput: { employeeId }, ctx: { authUser, supabase } }) => {
      requireAdmin(authUser.user?.app_metadata.role);

      const { data: employee, error: readError } = await supabaseAdmin
        .from('employees')
        .select('role, account_status, disabled_from_status')
        .eq('id', employeeId)
        .maybeSingle();
      if (readError) throw new Error(readError.message);
      if (!employee) throw new Error('Employee not found.');
      if (employee.role !== 'employee') {
        throw new Error('Administrator accounts cannot be enabled here.');
      }
      if (
        employee.account_status !== 'disabled' ||
        !employee.disabled_from_status
      ) {
        throw new Error('This employee is not disabled.');
      }

      const { error: updateError } = await supabase.rpc('set_employee_access', {
        p_employee_id: employeeId,
        p_disabled: false,
      });
      if (updateError) throw new Error(updateError.message);

      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(employeeId, {
          ban_duration: 'none',
        });
      if (authError) {
        await supabase.rpc('set_employee_access', {
          p_employee_id: employeeId,
          p_disabled: true,
        });
        throw new Error(authError.message);
      }
    },
  );

// Admin profile editor. Each write runs as the admin under the RLS *_admin
// policies and touches no protected column, so guard_employee_columns() passes.
// The satellites upsert because the row may not exist yet during onboarding.

export const updateEmployeeContact = authActionClient
  .schema(contactInfoWithIdSchema)
  .action(
    async ({
      parsedInput: {
        employeeId,
        phone,
        emergencyContact,
        address,
        city,
        postalCode,
      },
      ctx: { supabase, authUser },
    }) => {
      requireAdmin(authUser.user?.app_metadata.role);
      const { error } = await supabase
        .from('employees')
        .update({
          phone,
          emergency_contact: emergencyContact,
          address,
          city,
          postal_code: postalCode,
        })
        .eq('id', employeeId);
      if (error) throw new Error(error.message);
    },
  );

export const updateEmployeeBank = authActionClient
  .schema(bankInfoSchema.extend({ employeeId: employeeIdField }))
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.from('bank_details').upsert({
      employee_id: parsedInput.employeeId,
      bank_name: parsedInput.bankName,
      account_holder: parsedInput.accountHolderName,
      account_number: parsedInput.accountNumber,
      iban: parsedInput.iban,
      bank_branch: parsedInput.branch ?? null,
    });
    if (error) throw new Error(error.message);
  });

export const updateEmployeeSocials = authActionClient
  .schema(socialAccountsSchema.extend({ employeeId: employeeIdField }))
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.from('socials').upsert({
      employee_id: parsedInput.employeeId,
      github_url: parsedInput.github,
      linkedin_url: parsedInput.linkedin,
      twitter_url: parsedInput.twitter || null,
    });
    if (error) throw new Error(error.message);
  });

export const updateEmploymentDetails = authActionClient
  .schema(employmentConfigSchema.extend({ employeeId: employeeIdField }))
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.from('employment_details').upsert({
      employee_id: parsedInput.employeeId,
      employment_type: parsedInput.employmentType,
      base_salary: parsedInput.baseSalary,
      working_hours: parsedInput.workingHours,
      designation: parsedInput.designation,
      department: parsedInput.department || null,
      // null inherits the global setting; the schema maps a blank field to null
      // so a real 0 override survives.
      leave_pool_days_override: parsedInput.leavePoolDaysOverride ?? null,
      medical_accrual_monthly_override:
        parsedInput.medicalAccrualMonthlyOverride ?? null,
      medical_cap_override: parsedInput.medicalCapOverride ?? null,
      ot_multiplier_override: parsedInput.otMultiplierOverride ?? null,
    });
    if (error) throw new Error(error.message);
  });

export const resetEmployeeAllowanceOverrides = authActionClient
  .schema(employeeIdSchema)
  .action(
    async ({ parsedInput: { employeeId }, ctx: { supabase, authUser } }) => {
      requireAdmin(authUser.user?.app_metadata.role);
      const { error } = await supabase
        .from('employment_details')
        .update({
          leave_pool_days_override: null,
          medical_accrual_monthly_override: null,
          medical_cap_override: null,
          ot_multiplier_override: null,
        })
        .eq('employee_id', employeeId);
      if (error) throw new Error(error.message);
    },
  );
