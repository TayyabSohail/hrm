import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { ResetPasswordEmail } from '@/emails/reset-password-email';

type SendPasswordResetEmailInput = {
  to: string;
  fullName?: string | null;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  fullName,
  resetUrl,
}: SendPasswordResetEmailInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `Reset your ${appConfig.appName} password`,
    react: ResetPasswordEmail({
      fullName,
      resetUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }
}
