'use client';

import { useAction } from 'next-safe-action/hooks';

import { sendPayslipInvoice } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

export function useSendInvoice(onSuccess?: () => void) {
  return useAction(sendPayslipInvoice, {
    onSuccess: () => onSuccess?.(),
    onError,
  });
}
