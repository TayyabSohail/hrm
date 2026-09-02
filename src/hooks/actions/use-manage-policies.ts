'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import {
  createPolicy,
  deletePolicy,
  publishPolicyVersion,
} from '@/actions/policies';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

import { PolicyVersion } from '@/types/hrm';

const invalidatePolicies = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: [QueryKeys.POLICIES] });
  queryClient.invalidateQueries({ queryKey: [QueryKeys.ACTIVE_POLICIES] });
  queryClient.invalidateQueries({
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS],
  });
};
export function useCreatePolicy(
  onSuccess?: (policyId: string) => void,
  onCategoryError?: (message: string) => void,
) {
  const queryClient = useQueryClient();
  return useAction(createPolicy, {
    onSuccess: ({ data }) => {
      invalidatePolicies(queryClient);
      if (data) onSuccess?.(data.id);
    },
    onError: (args) => {
      const categoryError =
        args.error.validationErrors?.fieldErrors?.category?.[0];
      if (categoryError && onCategoryError) {
        onCategoryError(categoryError);
        return;
      }
      onError(args);
    },
  });
}

export function usePublishPolicyVersion(
  onSuccess?: (version: PolicyVersion) => void,
) {
  const queryClient = useQueryClient();
  return useAction(publishPolicyVersion, {
    onSuccess: ({ data }) => {
      invalidatePolicies(queryClient);
      if (data) {
        onSuccess?.({
          id: data.id,
          version: data.version,
          contentHtml: data.body_html,
          publishedAt: data.published_at,
          isActive: data.is_active,
        });
      }
    },
    onError,
  });
}

export function useDeletePolicy(onSuccess?: (policyId: string) => void) {
  const queryClient = useQueryClient();
  return useAction(deletePolicy, {
    onSuccess: ({ data }) => {
      invalidatePolicies(queryClient);
      if (data) onSuccess?.(data.id);
    },
    onError,
  });
}
