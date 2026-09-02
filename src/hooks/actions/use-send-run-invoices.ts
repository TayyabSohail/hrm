'use client';

import { useAction } from 'next-safe-action/hooks';

import { sendRunInvoices } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

export function useSendRunInvoices(
  onSuccess?: (invoices: { sent: number; failed: number }) => void,
) {
  return useAction(sendRunInvoices, {
    onSuccess: ({ data }) => {
      if (data) onSuccess?.(data.invoices);
    },
    onError,
  });
}
