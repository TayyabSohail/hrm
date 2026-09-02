'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PayslipNotificationBadgeProps = {
  status?: 'pending' | 'sent' | 'failed';
  sentAt?: string | null;
  lastError?: string | null;
};

export function PayslipNotificationBadge({
  status,
  sentAt,
  lastError,
}: PayslipNotificationBadgeProps) {
  if (status === 'sent') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant='default'>Sent</Badge>
        </TooltipTrigger>
        <TooltipContent>
          {sentAt ? new Date(sentAt).toLocaleString() : 'Sent'}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (status === 'failed') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant='destructive'>Failed</Badge>
        </TooltipTrigger>
        <TooltipContent>{lastError ?? 'Error sending'}</TooltipContent>
      </Tooltip>
    );
  }

  return <Badge variant='secondary'>Pending</Badge>;
}
