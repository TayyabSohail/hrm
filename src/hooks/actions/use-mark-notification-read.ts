'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { markAllRead, markNotificationRead } from '@/actions/notifications';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

const invalidateNotifications = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: [QueryKeys.NOTIFICATIONS] });
  queryClient.invalidateQueries({ queryKey: [QueryKeys.NOTIFICATIONS_UNREAD] });
};

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useAction(markNotificationRead, {
    onSuccess: () => invalidateNotifications(queryClient),
    onError,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useAction(markAllRead, {
    onSuccess: () => invalidateNotifications(queryClient),
    onError,
  });
}
