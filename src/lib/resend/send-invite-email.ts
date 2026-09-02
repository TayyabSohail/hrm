import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { OnboardingInviteEmail } from '@/emails/onboarding-invite-email';

type SendInviteEmailInput = {
  to: string;
  subject: string;
  // Fully rendered, sanitized HTML body (tokens already substituted).
  bodyHtml: string;
};

export async function sendInviteEmail({
  to,
  subject,
  bodyHtml,
}: SendInviteEmailInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject,
    react: OnboardingInviteEmail({
      bodyHtml,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }
}
