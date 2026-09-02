import { z } from 'zod';

import { getZodEnum } from '@/schema/common';

const isTodayOrEarlier = (value: string): boolean => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return value <= today;
};

export const overtimeLogSchema = z.object({
  date: z
    .string()
    .min(1, 'Pick the date the overtime was worked')
    .refine(isTodayOrEarlier, 'Overtime cannot be logged for a future date'),
  hours: z.coerce
    .number({ invalid_type_error: 'Enter the number of hours' })
    .positive('Hours must be greater than 0')
    .max(16, 'That looks too long for one day'),
  projectId: z.string().uuid('Select a project'),
  task: z.string().min(10, 'Describe the task (at least 10 characters)'),
});

export type OvertimeLogInput = z.infer<typeof overtimeLogSchema>;

export const reviewOvertimeSchema = z
  .object({
    id: z.string().uuid(),
    decision: getZodEnum(['approved', 'rejected'] as const),
    rejectionReason: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.decision === 'rejected' &&
      (!data.rejectionReason || data.rejectionReason.length < 5)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message:
          'Add a reason so the employee knows why (at least 5 characters)',
      });
    }
  });

export type ReviewOvertimeInput = z.infer<typeof reviewOvertimeSchema>;
