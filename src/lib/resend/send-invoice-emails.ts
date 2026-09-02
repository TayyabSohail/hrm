import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { InvoiceEmail } from '@/emails/invoice-email';

type SendInvoiceEmailInput = {
  to: string;
  fullName?: string | null;
  cycleLabel: string;
  payslipsUrl: string;
  pdf: { filename: string; content: Buffer };
};

export async function sendInvoiceEmail({
  to,
  fullName,
  cycleLabel,
  payslipsUrl,
  pdf,
}: SendInvoiceEmailInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `Your payslip for ${cycleLabel}`,
    react: InvoiceEmail({
      fullName,
      cycleLabel,
      payslipsUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
    attachments: [{ filename: pdf.filename, content: pdf.content }],
  });

  if (error) throw new Error(error.message);
}
