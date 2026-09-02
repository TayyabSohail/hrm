import { z } from 'zod';

import { PAYSLIP_LINE_ITEM_KINDS } from '@/constants/payroll-line-items';

export const updatePayrollSettingsSchema = z
  .object({
    overtimeMultiplier: z.coerce.number().positive().max(9.99),
    taxRatePercent: z.coerce.number().min(0).max(100),
    leavePoolDays: z.coerce.number().int().nonnegative(),
    medicalMonthlyAccrual: z.coerce.number().int().nonnegative(),
    medicalBalanceCap: z.coerce.number().int().nonnegative(),
    // "defaults" preserves employee-specific allowance overrides; "all"
    // replaces them with the new company configuration.
    employeeScope: z.enum(['defaults', 'all']).default('defaults'),
  })
  .partial();

export type UpdatePayrollSettingsInput = z.infer<
  typeof updatePayrollSettingsSchema
>;

export const createRunSchema = z.object({
  period_month: z.string().date(),
});
export type CreateRunInput = z.infer<typeof createRunSchema>;

export const runIdSchema = z.object({
  run_id: z.string().uuid(),
});
export type RunIdInput = z.infer<typeof runIdSchema>;

export const overrideDaysWorkedSchema = z.object({
  payslip_id: z.string().uuid(),
  days_worked: z.coerce.number().nonnegative().max(31).nullable(),
});
export type OverrideDaysWorkedInput = z.infer<typeof overrideDaysWorkedSchema>;

export const overrideOtMultiplierSchema = z.object({
  run_id: z.string().uuid(),
  payslip_ids: z.array(z.string().uuid()).min(1),
  overtime_multiplier: z.coerce.number().nonnegative().max(9.99).nullable(),
});
export type OverrideOtMultiplierInput = z.infer<
  typeof overrideOtMultiplierSchema
>;

export const overrideOtHoursSchema = z.object({
  payslip_id: z.string().uuid(),
  overtime_hours: z.coerce.number().nonnegative().max(744).nullable(),
});
export type OverrideOtHoursInput = z.infer<typeof overrideOtHoursSchema>;

export const customFieldSchema = z.object({
  label: z.string(),
  amount: z.number(),
});
export type CustomField = z.infer<typeof customFieldSchema>;

export const isCustomField = (value: unknown): value is CustomField =>
  customFieldSchema.safeParse(value).success;

export const addCustomFieldSchema = z.object({
  run_id: z.string().uuid(),
  payslip_ids: z.array(z.string().uuid()).min(1),
  label: z.string().trim().min(1, 'Enter a label').max(60),
  amount: z.coerce.number().refine((n) => n !== 0, 'Amount cannot be 0'),
});
export type AddCustomFieldInput = z.infer<typeof addCustomFieldSchema>;

export const payslipLineItemFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Enter a label')
    .max(60, 'Keep the label under 60 characters'),
  amount: z.coerce
    .number({ invalid_type_error: 'Enter an amount' })
    .positive('Enter an amount above 0'),
});
export type PayslipLineItemFormInput = z.infer<
  typeof payslipLineItemFormSchema
>;

export const bulkPayslipLineItemFormSchema = payslipLineItemFormSchema.extend({
  kind: z.enum(PAYSLIP_LINE_ITEM_KINDS),
});
export type BulkPayslipLineItemFormInput = z.infer<
  typeof bulkPayslipLineItemFormSchema
>;

export const removeCustomFieldSchema = z.object({
  payslip_id: z.string().uuid(),
  index: z.coerce.number().int().nonnegative(),
});
export type RemoveCustomFieldInput = z.infer<typeof removeCustomFieldSchema>;

export const sendInvoiceSchema = z.object({
  payslip_id: z.string().uuid(),
});
export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>;
