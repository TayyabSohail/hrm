import { z } from 'zod';

import {
  contactFields,
  EMERGENCY_CONTACT_DISTINCT_MESSAGE,
  phonesAreDistinct,
} from '@/schema/common';

export const employeeIdField = z.string().uuid();
export const employeeIdSchema = z.object({ employeeId: employeeIdField });

export const inviteEmployeeSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  // Optional: admins may invite with just an email. The "min 2" rule only bites
  // when a name is actually typed — a blank field (RHF sends '') is allowed and
  // normalised to null in the action.
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .optional()
    .or(z.literal('')),
});

export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;

const allowanceOverride = (unit: string, max?: number) => {
  let value = z.coerce
    .number({ invalid_type_error: `Enter a whole number of ${unit}` })
    .int(`Whole ${unit} only`)
    .nonnegative('Cannot be negative');
  if (max !== undefined) {
    value = value.max(max, 'That looks too high — double check it');
  }
  return z
    .union([z.literal('').transform(() => null), value])
    .nullable()
    .optional();
};

const multiplierOverride = () =>
  z
    .union([
      z.literal('').transform(() => null),
      z.coerce
        .number({ invalid_type_error: 'Enter an overtime multiplier' })
        .positive('Must be greater than 0')
        .max(9.99, 'This looks too high'),
    ])
    .nullable()
    .optional();

export const employmentConfigSchema = z.object({
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship'], {
    required_error: 'Select an employment type',
  }),
  employmentStage: z.enum(['probation', 'confirmed', 'notice_period'], {
    required_error: 'Select an employment stage',
  }),
  baseSalary: z.coerce
    .number({ invalid_type_error: 'Enter the base salary' })
    .positive('Base salary must be greater than 0'),
  workingHours: z.coerce
    .number({ invalid_type_error: 'Enter the standard working hours' })
    .positive('Working hours must be greater than 0')
    .max(400, 'Working hours look too high for one month'),
  designation: z.string().min(2, 'Enter a designation'),
  department: z.string().optional().or(z.literal('')),
  // Per-employee allowance overrides — blank inherits the global setting.
  leavePoolDaysOverride: allowanceOverride('days', 60),
  medicalAccrualMonthlyOverride: allowanceOverride('PKR'),
  medicalCapOverride: allowanceOverride('PKR'),
  otMultiplierOverride: multiplierOverride(),
});

// Input (form field values) and output (parsed) types differ only on the
// allowance overrides: the form holds '' for a blank field, which the schema
// transforms to null. The form is typed on the input; onSubmit receives output.
export type EmploymentConfigInput = z.input<typeof employmentConfigSchema>;
export type EmploymentConfigValues = z.output<typeof employmentConfigSchema>;

// Base object kept separate so admin actions can `.extend` it with employeeId
// (the refined schema below is a ZodEffects and has no `.extend`).
const contactInfoObject = z.object({ ...contactFields });

const distinctPhonesOptions = {
  message: EMERGENCY_CONTACT_DISTINCT_MESSAGE,
  path: ['emergencyContact'],
};

export const contactInfoSchema = contactInfoObject.refine(
  phonesAreDistinct,
  distinctPhonesOptions,
);

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;

export const contactInfoWithIdSchema = contactInfoObject
  .extend({ employeeId: employeeIdField })
  .refine(phonesAreDistinct, distinctPhonesOptions);

export type ContactInfoWithIdInput = z.infer<typeof contactInfoWithIdSchema>;

export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  dateOfBirth: z.string().min(1, 'Enter your date of birth'),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, 'CNIC format: 12345-1234567-1'),
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
