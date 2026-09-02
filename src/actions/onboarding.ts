'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { acceptInvitationSchema } from '@/schema/auth';
import {
  bankInfoSchema,
  consentSchema,
  personalInfoSchema,
  socialAccountsSchema,
} from '@/schema/onboarding';

export const acceptInvite = authActionClient
  .schema(acceptInvitationSchema)
  .action(async ({ parsedInput: { password }, ctx: { supabase } }) => {
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });
    // A prior attempt can save the password but fail before the transition RPC.
    // Re-accepting the same password must continue that pending transition
    // rather than trapping the employee on this screen.
    if (passwordError && passwordError.code !== 'same_password') {
      throw new Error(
        'Could not set your password. The invitation link may have expired — ask your admin to resend it.',
      );
    }

    const { error: rpcError } = await supabase.rpc('accept_onboarding');
    if (rpcError) {
      throw new Error('Could not complete your invitation. Please try again.');
    }
  });

// Onboarding wizard — per-section autosave. Every write runs as the caller and
// touches no protected column, so guard_employee_columns() passes. The
// employees row exists from the invite; the satellites may not, so they upsert.

export const savePersonal = authActionClient
  .schema(personalInfoSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { error } = await supabase
      .from('employees')
      .update({
        full_name: parsedInput.fullName,
        date_of_birth: parsedInput.dateOfBirth,
        phone: parsedInput.phone,
        emergency_contact: parsedInput.emergencyContact,
        address: parsedInput.address,
        city: parsedInput.city,
        postal_code: parsedInput.postalCode,
        cnic: parsedInput.cnic,
      })
      .eq('id', userId); // RLS employees_update_self
    if (error) throw new Error(error.message);
  });

export const saveBank = authActionClient
  .schema(bankInfoSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { error } = await supabase.from('bank_details').upsert({
      employee_id: userId,
      bank_name: parsedInput.bankName,
      account_holder: parsedInput.accountHolderName,
      account_number: parsedInput.accountNumber,
      iban: parsedInput.iban,
      bank_branch: parsedInput.branch ?? null,
    }); // RLS bank_own
    if (error) throw new Error(error.message);
  });

export const saveSocials = authActionClient
  .schema(socialAccountsSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { error } = await supabase.from('socials').upsert({
      employee_id: userId,
      github_url: parsedInput.github,
      linkedin_url: parsedInput.linkedin,
      twitter_url: parsedInput.twitter || null,
    }); // RLS socials_own
    if (error) throw new Error(error.message);
  });

export const submitOnboarding = authActionClient
  .schema(consentSchema)
  .action(async ({ ctx: { supabase } }) => {
    const { error } = await supabase.rpc('submit_onboarding');
    if (error) throw new Error(error.message);
  });
