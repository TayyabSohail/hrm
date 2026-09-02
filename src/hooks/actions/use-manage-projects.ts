'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import {
  createProject,
  deactivateProject,
  deleteProject,
  toggleProject,
} from '@/actions/projects';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

export function useCreateProject(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      onSuccess?.();
    },
    onError,
  });
}

export function useDeactivateProject(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(deactivateProject, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      onSuccess?.();
    },
    onError,
  });
}

export function useToggleProjectActive(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(toggleProject, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      onSuccess?.();
    },
    onError,
  });
}

export function useDeleteProject(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      onSuccess?.();
    },
    onError,
  });
}
