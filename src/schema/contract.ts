import { z } from 'zod';

import { hrmConfig } from '@/constants/hrm-config';

export const MAX_CONTRACT_FILE_BYTES =
  hrmConfig.maxContractFileSizeMb * 1024 * 1024;

const MAX_NOTE_LENGTH = 200;

export const uploadContractSchema = z
  .object({
    employeeId: z.string().uuid(),
    storagePath: z.string().min(1),
    fileName: z.string().min(1),
    note: z.string().trim().max(MAX_NOTE_LENGTH).optional(),
  })
  .refine((data) => data.storagePath.startsWith(`${data.employeeId}/`), {
    path: ['storagePath'],
    message: "Storage path must sit under the employee's own folder",
  });

export type UploadContractInput = z.infer<typeof uploadContractSchema>;

export const uploadContractFormSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .length(1, 'Attach the signed contract PDF')
    .refine(
      (files) => files.every((file) => file.size <= MAX_CONTRACT_FILE_BYTES),
      `The contract must be under ${hrmConfig.maxContractFileSizeMb}MB`,
    ),
  note: z
    .string()
    .trim()
    .max(MAX_NOTE_LENGTH, `Keep the note under ${MAX_NOTE_LENGTH} characters`)
    .optional(),
});

export type UploadContractFormInput = z.infer<typeof uploadContractFormSchema>;
