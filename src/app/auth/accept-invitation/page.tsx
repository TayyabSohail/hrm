import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form';
import { InviteTokenVerifier } from '@/components/auth/invite-token-verifier';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Accept invitation' };

type SearchParams = Promise<{ token_hash?: string; type?: string }>;

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session yet: exchange the emailed token on the client (a server component
  // can't write the session cookies). With no token present this is a stray
  // visit, so send them to sign in.
  if (!user) {
    const { token_hash: tokenHash, type } = await searchParams;
    if (tokenHash && type) {
      return <InviteTokenVerifier tokenHash={tokenHash} type={type} />;
    }
    redirect(paths.auth.login);
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('email, account_status')
    .eq('id', user.id)
    .maybeSingle();

  if (!employee) redirect(paths.auth.login);
  if (employee.account_status === 'onboarding') {
    redirect(paths.employee.onboarding);
  }
  if (employee.account_status !== 'invited') {
    redirect(paths.employee.dashboard);
  }

  return <AcceptInvitationForm email={employee.email} />;
}
