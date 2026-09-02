'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { addPayslipCustomField } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

export function useAddPayslipCustomField(
  onSuccess?: (added: { label: string; amount: number; count: number }) => void,
) {
  const queryClient = useQueryClient();
  return useAction(addPayslipCustomField, {
    onSuccess: ({ input }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      onSuccess?.({
        label: input.label,
        amount: Number(input.amount),
        count: input.payslip_ids.length,
      });
    },
    onError,
  });
}
