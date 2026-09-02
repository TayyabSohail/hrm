import { type TextFieldConfig } from '@/components/hrm/form-fields';

import { phoneMaxLength } from '@/schema/common';
import {
  type BankInfoInput,
  type DocType,
  type PersonalInfoInput,
  PK_IBAN_LENGTH,
  type SocialAccountsInput,
} from '@/schema/onboarding';

export const onboardingSteps = [
  'Personal Info',
  'Bank Info',
  'Social Accounts',
  'Identity Documents',
  'Consent',
] as const;

export const personalInfoFields: TextFieldConfig<
  Exclude<keyof PersonalInfoInput, 'dateOfBirth'>
>[] = [
  {
    name: 'fullName',
    label: 'Full name',
    placeholder: 'John Doe',
    fullWidth: true,
  },
  {
    name: 'phone',
    label: 'Phone number',
    placeholder: '03001234567',
    mask: 'digits',
    maxLength: phoneMaxLength,
  },
  {
    name: 'emergencyContact',
    label: 'Emergency contact number',
    placeholder: '03017654321',
    mask: 'digits',
    maxLength: phoneMaxLength,
  },
  {
    name: 'cnic',
    label: 'CNIC number',
    placeholder: '12345-1234567-1',
    mask: 'cnic',
  },
  {
    name: 'address',
    label: 'Street address',
    placeholder: 'House 12, Street 4, F-8/3',
    fullWidth: true,
  },
  { name: 'city', label: 'City', placeholder: 'Islamabad' },
  {
    name: 'postalCode',
    label: 'Postal code',
    placeholder: '44000',
    mask: 'digits',
    maxLength: 6,
  },
];

export const bankInfoFields: TextFieldConfig<keyof BankInfoInput>[] = [
  { name: 'bankName', label: 'Bank name', placeholder: 'e.g. Meezan Bank' },
  {
    name: 'accountHolderName',
    label: 'Account holder name',
    placeholder: 'John Doe',
  },
  {
    name: 'accountNumber',
    label: 'Account number',
    placeholder: '01234567890123',
    mask: 'digits',
    maxLength: 20,
  },
  {
    name: 'iban',
    label: 'IBAN',
    placeholder: 'PK36MEZN0001234567890123',
    maxLength: PK_IBAN_LENGTH,
  },
  {
    name: 'branch',
    label: 'Bank branch (optional)',
    placeholder: 'F-8 Markaz, Islamabad',
  },
];

export const IDENTITY_DOC_MIME_TYPES = [
  'image/png',
  'application/pdf',
] as const;
export const IDENTITY_DOC_ACCEPT = IDENTITY_DOC_MIME_TYPES.join(',');
export const IDENTITY_DOC_MAX_SIZE_MB = 5;
export const IDENTITY_DOC_HINT = 'PNG or PDF · up to 5MB';

export const socialAccountsFields: {
  name: keyof SocialAccountsInput;
  label: string;
  placeholder: string;
}[] = [
  {
    name: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username',
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    name: 'twitter',
    label: 'Twitter (optional)',
    placeholder: 'https://twitter.com/username',
  },
];

export const identityDocuments: { docType: DocType; label: string }[] = [
  { docType: 'cnic_front', label: 'Front of CNIC' },
  { docType: 'cnic_back', label: 'Back of CNIC' },
  { docType: 'photo', label: 'Recent photo (face clearly visible)' },
];
