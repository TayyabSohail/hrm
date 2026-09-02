import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Enter a project name'),
  description: z.string().trim().min(4, 'Enter a short description'),
  techStack: z.string().trim().min(1, 'Enter at least one technology'),
  url: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const toggleProjectSchema = z.object({
  projectId: z.string().uuid(),
  active: z.boolean(),
});

export type ToggleProjectInput = z.infer<typeof toggleProjectSchema>;

export const projectIdSchema = z.object({
  projectId: z.string().uuid(),
});

export type ProjectIdInput = z.infer<typeof projectIdSchema>;
