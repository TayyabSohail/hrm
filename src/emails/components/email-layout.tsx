import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

import { brand, emailStyles } from '@/emails/theme';

export type EmailLayoutProps = {
  appName: string;
  baseUrl: string;
  supportEmail: string;
  preview: string;
  children: ReactNode;
};

export function EmailLayout({
  appName,
  baseUrl,
  supportEmail,
  preview,
  children,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.header}>
            <Img
              src={`${baseUrl}/email/logo.png`}
              width='40'
              height='42'
              alt='Bitsmiths'
              style={emailStyles.logo}
            />
            <Text style={emailStyles.wordmark}>Bitsmiths</Text>
          </Section>

          {children}

          <Hr style={emailStyles.hr} />

          <Section>
            <Text style={emailStyles.footer}>
              Need a hand? Reach us at{' '}
              <Link
                href={`mailto:${supportEmail}`}
                style={emailStyles.footerLink}
              >
                {supportEmail}
              </Link>
              .
            </Text>
            <Text style={emailStyles.footerFine}>
              © {appName} · Sent by the {appName} team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Shared accent colour handle so templates don't reach into the palette.
export { brand };
