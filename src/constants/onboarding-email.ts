export const ONBOARDING_EMAIL_TOKENS = [
  { token: '{{employee_name}}', label: 'Employee name', sample: 'Ayesha Khan' },
  {
    token: '{{onboarding_link}}',
    label: 'Onboarding link',
    sample: 'https://hrm.bitsmiths.studio/auth/accept-invitation',
  },
] as const;

export const fillOnboardingPreview = (text: string) =>
  ONBOARDING_EMAIL_TOKENS.reduce(
    (result, { token, sample }) => result.split(token).join(sample),
    text,
  );
