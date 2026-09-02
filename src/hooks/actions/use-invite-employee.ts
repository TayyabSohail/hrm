'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import {
  cancelInvite,
  disableEmployee,
  enableEmployee,
  inviteEmployee,
  resendInvite,
} from '@/actions/employees';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

export function useInviteEmployee(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAction(inviteEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
      // A new invited account changes the per-status breakdown.
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EMPLOYEES_BY_STATUS],
      });
      onSuccess?.();
    },
    onError,
  });
}

export function useResendInvite(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAction(resendInvite, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
      onSuccess?.();
    },
    onError,
  });
}

export function useCancelInvite(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAction(cancelInvite, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
      // Dropping the invited account changes the per-status breakdown.
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EMPLOYEES_BY_STATUS],
      });
      onSuccess?.();
    },
    onError,
  });
}

export function useDisableEmployee(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAction(disableEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DASHBOARD_SUMMARY],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EMPLOYEES_BY_STATUS],
      });
      onSuccess?.();
    },
    onError,
  });
}

export function useEnableEmployee(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAction(enableEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DASHBOARD_SUMMARY],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EMPLOYEES_BY_STATUS],
      });
      onSuccess?.();
    },
    onError,
  });
}
