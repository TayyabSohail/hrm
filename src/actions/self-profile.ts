'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { contactInfoSchema, personalDetailsSchema } from '@/schema/employee';
import { bankInfoSchema, socialAccountsSchema } from '@/schema/onboarding';

// Self-service profile writes. No admin guard by design: every write runs as
// the caller and is scoped to auth.uid() by RLS. guard_employee_columns blocks
// protected columns, and employment_details has no self-write policy, so salary
// and designation stay admin-owned even against a forged request.
// The employees row exists from the invite; bank/socials rows may not, so those
// upsert.

export const updateMyProfile = authActionClient
  .schema(contactInfoSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { error } = await supabase
      .from('employees')
      .update({
        phone: parsedInput.phone,
        emergency_contact: parsedInput.emergencyContact,
        address: parsedInput.address,
        city: parsedInput.city,
        postal_code: parsedInput.postalCode,
      })
      .eq('id', userId); // RLS employees_update_self
    if (error) throw new Error(error.message);
  });

export const updateMyPersonalInfo = authActionClient
  .schema(personalDetailsSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { error } = await supabase
      .from('employees')
      .update({
        full_name: parsedInput.fullName,
        date_of_birth: parsedInput.dateOfBirth,
        cnic: parsedInput.cnic,
      })
      .eq('id', userId); // RLS employees_update_self
    if (error) throw new Error(error.message);
  });

export const updateMyBank = authActionClient
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

export const updateMySocials = authActionClient
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
