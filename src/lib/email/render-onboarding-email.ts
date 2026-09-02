import { escapeHtml } from '@/lib/escape-html';

const DEFAULT_SUBJECT = 'You’re invited to join Bitsmiths HRM';
const DEFAULT_BODY =
  '<p>Hi {{employee_name}},</p>' +
  '<p>You’ve been invited to join Bitsmiths HRM. Click the link below to ' +
  'set up your account and complete onboarding.</p>' +
  '<p><a href="{{onboarding_link}}">Accept your invitation</a></p>';

const INVITE_BUTTON_STYLE =
  'display:inline-block;background-color:#04CD77;color:#ffffff;' +
  'font-size:15px;font-weight:600;line-height:20px;text-decoration:none;' +
  'border-radius:8px;padding:13px 28px;';

function styleOnboardingLink(bodyHtml: string) {
  return bodyHtml.replace(
    /<p>\s*<a\b([^>]*\bhref=["']\{\{onboarding_link\}\}["'][^>]*)>([\s\S]*?)<\/a>\s*<\/p>/gi,
    (_match, attributes: string, label: string) =>
      `<p style="margin:28px 0 8px;text-align:center;"><a ${attributes} style="${INVITE_BUTTON_STYLE}">${label}</a></p>`,
  );
}

type OnboardingTemplateRow = {
  subject: string | null;
  body_html: string | null;
} | null;

type OnboardingEmailVars = {
  onboardingLink: string;
  employeeName: string;
};

export function renderOnboardingEmail(
  template: OnboardingTemplateRow,
  vars: OnboardingEmailVars,
) {
  const rawSubject = template?.subject?.trim() || DEFAULT_SUBJECT;
  const rawBody = template?.body_html?.trim() || DEFAULT_BODY;

  const subject = rawSubject
    .replaceAll('{{onboarding_link}}', vars.onboardingLink)
    .replaceAll('{{employee_name}}', vars.employeeName);

  const html = styleOnboardingLink(rawBody)
    .replaceAll('{{onboarding_link}}', escapeHtml(vars.onboardingLink))
    .replaceAll('{{employee_name}}', escapeHtml(vars.employeeName));

  return { subject, html };
}
