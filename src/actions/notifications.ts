'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { markAllReadSchema, markReadSchema } from '@/schema/notification';

export const markNotificationRead = authActionClient
  .schema(markReadSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const recipientId = authUser.user?.id;
    if (!recipientId) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', parsedInput.id)
      .eq('recipient_id', recipientId)
      .is('read_at', null);
    if (error) throw new Error(error.message);

    return { success: true };
  });

export const markAllRead = authActionClient
  .schema(markAllReadSchema)
  .action(async ({ ctx: { supabase, authUser } }) => {
    const recipientId = authUser.user?.id;
    if (!recipientId) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', recipientId)
      .is('read_at', null);
    if (error) throw new Error(error.message);

    return { success: true };
  });
