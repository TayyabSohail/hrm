import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type OvertimeSubmittedEmailProps = {
  adminName?: string | null;
  employeeName: string;
  summary: string;
  task: string;
  reviewUrl: string;
  appName: string;
  baseUrl: string;
  supportEmail: string;
};

export function OvertimeSubmittedEmail({
  adminName,
  employeeName,
  summary,
  task,
  reviewUrl,
  appName,
  baseUrl,
  supportEmail,
}: OvertimeSubmittedEmailProps) {
  const greeting = adminName ? `Hi ${adminName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`${employeeName} logged overtime`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>New overtime log</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          <strong>{employeeName}</strong> logged overtime. It&apos;s now waiting
          in your approvals queue.
        </Text>

        <Section
          style={{
            ...emailStyles.callout,
            borderLeftColor: brand.green,
            backgroundColor: brand.greenBg,
          }}
        >
          <Text style={emailStyles.detailRow}>
            <span style={emailStyles.detailLabel}>Overtime: </span>
            {summary}
          </Text>
          <Text style={{ ...emailStyles.detailRow, margin: 0 }}>
            <span style={emailStyles.detailLabel}>Task: </span>
            {task}
          </Text>
        </Section>

        <Text style={emailStyles.paragraph}>
          Review the log, then approve or reject it from the queue. Only
          approved hours are paid out.
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
OvertimeSubmittedEmail.PreviewProps = {
  adminName: 'Bilal Ahmed',
  employeeName: 'Ayesha Khan',
  summary: '3 hr(s) · HRM Frontend',
  task: 'Payroll table release crunch',
  reviewUrl: 'http://localhost:3000/admin/approvals',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies OvertimeSubmittedEmailProps;

export default OvertimeSubmittedEmail;
