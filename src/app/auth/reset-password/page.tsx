import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { RecoveryTokenVerifier } from '@/components/auth/recovery-token-verifier';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Set a new password' };

type SearchParams = Promise<{ token_hash?: string; type?: string }>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { token_hash: tokenHash, type } = await searchParams;
    if (tokenHash && type === 'recovery') {
      return <RecoveryTokenVerifier tokenHash={tokenHash} />;
    }
    redirect(paths.auth.login);
  }

  return <ResetPasswordForm />;
}
