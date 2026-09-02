'use client';

import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { useSendInvoice } from '@/hooks/actions/use-send-invoice';

import { Button } from '@/components/ui/button';

type SendInvoiceButtonProps = {
  payslipId: string;
  employeeName: string;
  disabled?: boolean;
};

export function SendInvoiceButton({
  payslipId,
  employeeName,
  disabled,
}: SendInvoiceButtonProps) {
  const send = useSendInvoice(() =>
    toast.success(`Invoice sent to ${employeeName}`),
  );

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      isLoading={send.isPending}
      disabled={disabled}
      onClick={() => send.execute({ payslip_id: payslipId })}
      title={
        disabled
          ? 'Finalize the run to send invoices'
          : `Send invoice to ${employeeName}`
      }
      aria-label={`Send invoice to ${employeeName}`}
    >
      <Send className='size-4' />
    </Button>
  );
}
