import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type MedicalDecisionEmailProps = {
  fullName?: string | null;
  decision: 'approved' | 'rejected';
  summary: string;
  rejectionReason?: string | null;
  medicalUrl: string;
  appName: string;
  baseUrl: string;
  supportEmail: string;
};

export function MedicalDecisionEmail({
  fullName,
  decision,
  summary,
  rejectionReason,
  medicalUrl,
  appName,
  baseUrl,
  supportEmail,
}: MedicalDecisionEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';
  const approved = decision === 'approved';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`Your medical claim was ${decision}`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>
          {approved ? 'Medical claim approved' : 'Medical claim rejected'}
        </Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Your medical claim — <strong>{summary}</strong> — was{' '}
          <strong>{decision}</strong>.
        </Text>

        {approved ? (
          <Section
            style={{
              ...emailStyles.callout,
              borderLeftColor: brand.green,
              backgroundColor: brand.greenBg,
            }}
          >
            <Text style={{ ...emailStyles.calloutText, margin: 0 }}>
              This claim has been deducted from your medical balance and will be
              reflected in your next payslip&apos;s medical line.
            </Text>
          </Section>
        ) : (
          <Section
            style={{
              ...emailStyles.callout,
              borderLeftColor: brand.green,
              backgroundColor: brand.greenBg,
            }}
          >
            <Text
              style={{ ...emailStyles.calloutLabel, color: brand.greenDark }}
            >
              Reason for rejection
            </Text>
            <Text style={emailStyles.calloutText}>
              {rejectionReason || 'No reason was provided.'}
            </Text>
          </Section>
        )}

        <Section style={emailStyles.buttonWrap}>
          <Button href={medicalUrl} style={emailStyles.button}>
            View my claims
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
// Flip `decision` to 'rejected' to preview the amber rejection-reason callout.
MedicalDecisionEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  decision: 'approved',
  summary: 'Doctor Consultation · PKR 3,000 · Self',
  rejectionReason: 'The attached receipt was not legible. Please resubmit.',
  medicalUrl: 'http://localhost:3000/medical',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies MedicalDecisionEmailProps;

export default MedicalDecisionEmail;
