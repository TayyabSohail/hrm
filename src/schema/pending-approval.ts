import { z } from 'zod';

import { PendingApproval } from '@/types/hrm';

export const pendingApprovalSchema = z.object({
  kind: z.enum(['leave', 'medical', 'overtime']),
  item_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  employee_name: z
    .string()
    .nullable()
    .transform((value) => value ?? ''),
  summary: z.string(),
  amount: z.number().nullable(),
  submitted_at: z.string(),
}) satisfies z.ZodType<PendingApproval, z.ZodTypeDef, unknown>;

export const pendingApprovalsSchema = z.array(pendingApprovalSchema);
