import { z } from 'zod';

export const fxRatesResponseSchema = z.object({
  result: z.literal('success'),
  base_code: z.string(),
  rates: z.record(z.string(), z.number()),
});

export type FxRatesResponse = z.infer<typeof fxRatesResponseSchema>;
