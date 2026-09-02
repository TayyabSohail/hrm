'use server';

import { authActionClient } from '@/lib/server/safe-action';

import {
  createProjectSchema,
  projectIdSchema,
  toggleProjectSchema,
} from '@/schema/project';

// Defense in depth: RLS enforces the same thing.
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

export const createProject = authActionClient
  .schema(createProjectSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: parsedInput.name,
        description: parsedInput.description,
        tech_stack: parsedInput.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        url: parsedInput.url || null,
        is_active: true,
      })
      .select('id, name')
      .single();
    if (error) {
      throw new Error(
        error.code === '23505'
          ? 'A project with that name already exists'
          : error.message,
      );
    }

    return data;
  });

export const toggleProject = authActionClient
  .schema(toggleProjectSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { error } = await supabase
      .from('projects')
      .update({ is_active: parsedInput.active })
      .eq('id', parsedInput.projectId);
    if (error) throw new Error(error.message);

    return { id: parsedInput.projectId };
  });

export const deactivateProject = authActionClient
  .schema(projectIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { error } = await supabase
      .from('projects')
      .update({ is_active: false })
      .eq('id', parsedInput.projectId);
    if (error) throw new Error(error.message);

    return { id: parsedInput.projectId };
  });

export const deleteProject = authActionClient
  .schema(projectIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', parsedInput.projectId);
    if (error) {
      throw new Error(
        error.code === '23503'
          ? 'This project has overtime logs and cannot be deleted — deactivate it instead.'
          : error.message,
      );
    }

    return { id: parsedInput.projectId };
  });
