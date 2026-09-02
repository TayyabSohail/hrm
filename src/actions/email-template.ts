'use server';

import { sanitizeHtml } from '@/lib/sanitize-html';
import { authActionClient } from '@/lib/server/safe-action';

import { emailTemplateSchema } from '@/schema/email-template';

export const updateOnboardingEmailTemplate = authActionClient
  .schema(emailTemplateSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const user = authUser.user;
    if (!user || user.app_metadata.role !== 'admin') {
      throw new Error('Forbidden');
    }

    // `updated_at` is refreshed by the set_updated_at trigger.
    const { error } = await supabase
      .from('onboarding_email_template')
      .update({
        subject: parsedInput.subject,
        body_html: sanitizeHtml(parsedInput.bodyHtml),
        updated_by: user.id,
      })
      .eq('id', true);
    if (error) throw new Error(error.message);

    return { success: true };
  });
