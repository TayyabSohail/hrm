import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type MedicalSubmittedEmailProps = {
  adminName?: string | null;
  employeeName: string;
  summary: string;
  description: string;
  reviewUrl: string;
  appName: string;
  baseUrl: string;
  supportEmail: string;
};

export function MedicalSubmittedEmail({
  adminName,
  employeeName,
  summary,
  description,
  reviewUrl,
  appName,
  baseUrl,
  supportEmail,
}: MedicalSubmittedEmailProps) {
  const greeting = adminName ? `Hi ${adminName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`${employeeName} submitted a medical claim`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>New medical claim</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          <strong>{employeeName}</strong> submitted a medical claim. It&apos;s
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
            <span style={emailStyles.detailLabel}>Claim: </span>
            {summary}
          </Text>
          <Text style={{ ...emailStyles.detailRow, margin: 0 }}>
            <span style={emailStyles.detailLabel}>Details: </span>
            {description}
          </Text>
        </Section>

        <Text style={emailStyles.paragraph}>
          Review the claim and its proof files, then approve or reject it from
          the queue.
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
MedicalSubmittedEmail.PreviewProps = {
  adminName: 'Bilal Ahmed',
  employeeName: 'Ayesha Khan',
  summary: 'Doctor Consultation · PKR 3,000 · Self',
  description: 'Follow-up consultation and prescribed medication.',
  reviewUrl: 'http://localhost:3000/admin/approvals',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies MedicalSubmittedEmailProps;

export default MedicalSubmittedEmail;
