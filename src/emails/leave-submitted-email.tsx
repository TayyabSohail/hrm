import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type LeaveSubmittedEmailProps = {
  adminName?: string | null;
  employeeName: string;
  summary: string;
  reason: string;
  reviewUrl: string;
  appName: string;
  baseUrl: string;
  supportEmail: string;
};

export function LeaveSubmittedEmail({
  adminName,
  employeeName,
  summary,
  reason,
  reviewUrl,
  appName,
  baseUrl,
  supportEmail,
}: LeaveSubmittedEmailProps) {
  const greeting = adminName ? `Hi ${adminName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`${employeeName} submitted a leave request`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>New leave request</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          <strong>{employeeName}</strong> submitted a leave request. It&apos;s
          now waiting in your approvals queue.
        </Text>

        <Section
          style={{
            ...emailStyles.callout,
            borderLeftColor: brand.green,
            backgroundColor: brand.greenBg,
          }}
        >
          <Text style={emailStyles.detailRow}>
            <span style={emailStyles.detailLabel}>Request: </span>
            {summary}
          </Text>
          <Text style={{ ...emailStyles.detailRow, margin: 0 }}>
            <span style={emailStyles.detailLabel}>Reason: </span>
            {reason}
          </Text>
        </Section>

        <Text style={emailStyles.paragraph}>
          Review the request, then approve or reject it from the queue.
        </Text>

        <Section style={emailStyles.buttonWrap}>
          <Button href={reviewUrl} style={emailStyles.button}>
            Review in approvals
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
LeaveSubmittedEmail.PreviewProps = {
  adminName: 'Bilal Ahmed',
  employeeName: 'Ayesha Khan',
  summary: 'Paid Leave · 3 day(s) from Jul 8, 2026',
  reason: 'Attending my sister’s wedding out of town.',
  reviewUrl: 'http://localhost:3000/admin/approvals',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies LeaveSubmittedEmailProps;

export default LeaveSubmittedEmail;
