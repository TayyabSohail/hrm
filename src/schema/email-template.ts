import { z } from 'zod';

export const emailTemplateSchema = z.object({
  subject: z.string().trim().min(1, 'Enter a subject line').max(300),
  bodyHtml: z
    .string()
    .trim()
    .min(1, 'Write the email body')
    .refine(
      (html) => html.includes('{{onboarding_link}}'),
      'The body must include the {{onboarding_link}} token so invitees can complete onboarding.',
    ),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
