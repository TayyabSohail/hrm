import { z } from 'zod';

const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO currency code');

export const exportPayoneerSchema = z.object({
  run_id: z.string().uuid(),
  currencyByEmployee: z
    .record(z.string().uuid(), currencyCode)
    .refine(
      (map) => Object.keys(map).length > 0,
      'Choose a source currency for at least one employee',
    ),
  excludedEmployeeIds: z.array(z.string().uuid()).default([]),
});

export type ExportPayoneerInput = z.infer<typeof exportPayoneerSchema>;
