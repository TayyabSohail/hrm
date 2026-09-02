import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { LeaveDecisionEmail } from '@/emails/leave-decision-email';
import { LeaveSubmittedEmail } from '@/emails/leave-submitted-email';

type SendLeaveSubmittedInput = {
  to: string;
  adminName?: string | null;
  employeeName: string;
  summary: string;
  reason: string;
  reviewUrl: string;
};

export async function sendLeaveSubmittedEmail({
  to,
  adminName,
  employeeName,
  summary,
  reason,
  reviewUrl,
}: SendLeaveSubmittedInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `New leave request — ${employeeName}`,
    react: LeaveSubmittedEmail({
      adminName,
      employeeName,
      summary,
      reason,
      reviewUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}

type SendLeaveDecisionInput = {
  to: string;
  fullName?: string | null;
  decision: 'approved' | 'rejected';
  summary: string;
  rejectionReason?: string | null;
  leaveUrl: string;
};

export async function sendLeaveDecisionEmail({
  to,
  fullName,
  decision,
  summary,
  rejectionReason,
  leaveUrl,
}: SendLeaveDecisionInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject:
      decision === 'approved'
        ? 'Your leave request was approved'
        : 'Your leave request was rejected',
    react: LeaveDecisionEmail({
      fullName,
      decision,
      summary,
      rejectionReason,
      leaveUrl: leaveUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}
