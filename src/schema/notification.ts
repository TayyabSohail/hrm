import { z } from 'zod';

export const markReadSchema = z.object({ id: z.string().uuid() });
export type MarkReadInput = z.infer<typeof markReadSchema>;

export const markAllReadSchema = z.object({});
export type MarkAllReadInput = z.infer<typeof markAllReadSchema>;
