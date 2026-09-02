'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { createLeaveRequest } from '@/actions/leave';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';
import { type LeaveRequestInput } from '@/schema/leave';

export function useCreateLeaveRequest(
  onSuccess?: (input: LeaveRequestInput) => void,
) {
  const queryClient = useQueryClient();
  return useAction(createLeaveRequest, {
    onSuccess: ({ input }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_BALANCE] });
      onSuccess?.(input);
    },
    onError,
  });
}
