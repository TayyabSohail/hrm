'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { acknowledgePolicy } from '@/actions/policies';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

export function useAcknowledgePolicy(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const action = useAction(acknowledgePolicy, { onError });

  const executeAsync: typeof action.executeAsync = async (input) => {
    const result = await action.executeAsync(input);
    if (result?.data) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS],
      });
      onSuccess?.();
    } else if (result?.serverError) {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POLICIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ACTIVE_POLICIES] });
    }
    return result;
  };

  return { ...action, executeAsync };
}
