import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { emailStyles } from '@/emails/theme';

export type InvoiceEmailProps = {
  fullName?: string | null;
  cycleLabel: string;
  payslipsUrl: string;
  appName: string;
  baseUrl: string;
  supportEmail: string;
};

export function InvoiceEmail({
  fullName,
  cycleLabel,
  payslipsUrl,
  appName,
  baseUrl,
  supportEmail,
}: InvoiceEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`Your ${cycleLabel} payslip is ready`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>Your payslip is ready</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Your <strong>{cycleLabel}</strong> payslip is ready and attached as a
          PDF. You can also view it anytime from your payslips page.
        </Text>

        <Section style={emailStyles.buttonWrap}>
          <Button href={payslipsUrl} style={emailStyles.button}>
            View my payslips
          </Button>
        </Section>

        <Text style={emailStyles.note}>
          Something look wrong? Reply to this email and we&apos;ll take a look.
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
InvoiceEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  cycleLabel: 'June 2026',
  payslipsUrl: 'http://localhost:3000/payslips',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies InvoiceEmailProps;

export default InvoiceEmail;
