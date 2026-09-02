import 'server-only';

import { renderOnboardingEmail } from '@/lib/email/render-onboarding-email';
import { sendInviteEmail } from '@/lib/resend/send-invite-email';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Logger from '@/utils/logger';

type SendOnboardingInviteInput = {
  to: string;
  employeeName: string;
  onboardingLink: string;
};

export async function sendOnboardingInvite({
  to,
  employeeName,
  onboardingLink,
}: SendOnboardingInviteInput) {
  const { data: template, error } = await supabaseAdmin
    .from('onboarding_email_template')
    .select('subject, body_html')
    .eq('id', true)
    .maybeSingle();
  if (error || !template) {
    Logger.error(
      'Onboarding email template unavailable — sending built-in default',
      error,
    );
  }

  const { subject, html } = renderOnboardingEmail(template ?? null, {
    onboardingLink,
    employeeName,
  });

  await sendInviteEmail({ to, subject, bodyHtml: html });
}
