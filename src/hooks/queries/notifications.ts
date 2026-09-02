import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { Notification } from '@/types/hrm';

const NOTIFICATION_COLUMNS = 'id, type, title, body, link, read_at, created_at';

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const toNotification = (row: NotificationRow) =>
  ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    readAt: row.read_at,
    createdAt: row.created_at,
  }) satisfies Notification;

const fetchNotifications = authQuery(
  async ({ supabase, user }): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select(NOTIFICATION_COLUMNS)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    return data.map(toNotification);
  },
);

const fetchUnreadCount = authQuery(
  async ({ supabase, user }): Promise<number> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .is('read_at', null);
    if (error) throw new Error(error.message);

    return count ?? 0;
  },
);

const NOTIFICATION_REFETCH_MS = 60_000;

export const useNotifications = () =>
  useQuery({
    queryKey: [QueryKeys.NOTIFICATIONS],
    queryFn: () => fetchNotifications(),
    refetchInterval: NOTIFICATION_REFETCH_MS,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: [QueryKeys.NOTIFICATIONS_UNREAD],
    queryFn: () => fetchUnreadCount(),
    refetchInterval: NOTIFICATION_REFETCH_MS,
  });
