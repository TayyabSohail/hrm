'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { updatePayrollSettings } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

export function useUpdatePayrollSettings(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(updatePayrollSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HRM_SETTINGS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_BALANCE] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_BALANCE] });
      onSuccess?.();
    },
    onError,
  });
}
