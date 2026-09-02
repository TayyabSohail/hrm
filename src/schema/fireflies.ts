import { z } from 'zod';

export const FIREFLIES_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'Urdu' },
] as const;

export const firefliesLanguageSchema = z.enum(['en', 'ur']);

export const RATE_LIMIT_MESSAGE =
  'Fireflies allows 3 notetaker requests every 20 minutes across the whole team. Try again shortly.';

export const summonNotetakerSchema = z.object({
  meetingLink: z
    .string()
    .trim()
    .url('Paste a valid meeting link')
    // Fireflies needs to be able to dial in; anything that is not http(s) will
    // be rejected by the API anyway, so fail here with a clearer message.
    .refine((value) => /^https?:\/\//i.test(value), 'Link must start with http(s)'),
  title: z
    .string()
    .trim()
    .min(1, 'Give the meeting a title')
    .max(200, 'Keep the title under 200 characters'),
  language: firefliesLanguageSchema,
  shareWith: z.array(z.string().uuid()).default([]),
});

export type SummonNotetakerInput = z.infer<typeof summonNotetakerSchema>;
