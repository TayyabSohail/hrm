import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { MedicalDecisionEmail } from '@/emails/medical-decision-email';
import { MedicalSubmittedEmail } from '@/emails/medical-submitted-email';

type SendMedicalSubmittedInput = {
  to: string;
  adminName?: string | null;
  employeeName: string;
  summary: string;
  description: string;
  reviewUrl: string;
};

export async function sendMedicalSubmittedEmail({
  to,
  adminName,
  employeeName,
  summary,
  description,
  reviewUrl,
}: SendMedicalSubmittedInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `New medical claim — ${employeeName}`,
    react: MedicalSubmittedEmail({
      adminName,
      employeeName,
      summary,
      description,
      reviewUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}

type SendMedicalDecisionInput = {
  to: string;
  fullName?: string | null;
  decision: 'approved' | 'rejected';
  summary: string;
  rejectionReason?: string | null;
  medicalUrl: string;
};

export async function sendMedicalDecisionEmail({
  to,
  fullName,
  decision,
  summary,
  rejectionReason,
  medicalUrl,
}: SendMedicalDecisionInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject:
      decision === 'approved'
        ? 'Your medical claim was approved'
        : 'Your medical claim was rejected',
    react: MedicalDecisionEmail({
      fullName,
      decision,
      summary,
      rejectionReason,
      medicalUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}
