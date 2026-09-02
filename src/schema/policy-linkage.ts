import { z } from 'zod';

export const markReviewedSchema = z.object({ policyId: z.string().uuid() });
export type MarkReviewedInput = z.infer<typeof markReviewedSchema>;
