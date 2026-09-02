import { z } from 'zod';

import { hrmConfig } from '@/constants/hrm-config';
import { getZodEnum } from '@/schema/common';

export const leaveTypeEnum = getZodEnum([
  'paid',
  'sick',
  'unpaid',
  'half_day',
] as const);

const isTodayOrLater = (value: string): boolean => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return value >= today;
};

export const createLeaveRequestSchema = z
  .object({
    type: leaveTypeEnum,
    startDate: z
      .string()
      .min(1, 'Pick the first day of leave')
      .refine(isTodayOrLater, 'Leave cannot start in the past'),
    days: z.coerce
      .number({ invalid_type_error: 'Enter the number of days' })
      .positive('Days must be greater than 0')
      .max(60, 'That looks too long for one request')
      .refine((value) => value % 0.5 === 0, 'Use half-day increments (0.5)'),
    reason: z
      .string()
      .min(10, 'Give a short but clear reason (at least 10 characters)'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'half_day' && data.days !== hrmConfig.halfDayValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['days'],
        message: 'A half day is always 0.5 days',
      });
    }
  });

export type LeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;

export const reviewLeaveSchema = z
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

export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
