'use server';

import { returnValidationErrors } from 'next-safe-action';

import { sendPolicyUpdatedEmail } from '@/lib/resend/send-policy-emails';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { authActionClient } from '@/lib/server/safe-action';
import Logger from '@/utils/logger';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import {
  acknowledgePolicySchema,
  createPolicySchema,
  deletePolicySchema,
  DUPLICATE_TITLE_MESSAGE,
  publishPolicyVersionSchema,
} from '@/schema/policy';
import { markReviewedSchema } from '@/schema/policy-linkage';

const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

export const createPolicy = authActionClient
  .schema(createPolicySchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase.rpc('create_policy', {
      p_title: parsedInput.title,
      p_category: parsedInput.category,
      p_body_html: sanitizeHtml(parsedInput.contentHtml),
    });
    if (error) {
      // 23505 is the title-derived `slug`, not the category — categories may repeat.
      if (error.code === '23505') {
        returnValidationErrors(createPolicySchema, {
          title: { _errors: [DUPLICATE_TITLE_MESSAGE] },
        });
      }
      throw new Error(error.message);
    }

    return data;
  });

export const publishPolicyVersion = authActionClient
  .schema(publishPolicyVersionSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase.rpc('publish_policy_version', {
      p_policy_id: parsedInput.policyId,
      p_body_html: sanitizeHtml(parsedInput.bodyHtml),
    });
    if (error) throw new Error(error.message);

    // Best-effort: the version is already published, so a Resend failure must
    // not undo it.
    try {
      const [
        { data: policy, error: policyError },
        { data: employees, error: employeesError },
      ] = await Promise.all([
        supabase
          .from('policies')
          .select('title')
          .eq('id', parsedInput.policyId)
          .single(),
        supabase
          .from('employees')
          .select('email, full_name')
          .eq('account_status', 'active'),
      ]);

      if (policyError) throw policyError;
      if (employeesError) throw employeesError;

      const policyUrl = new URL(
        paths.employee.policyDetail(parsedInput.policyId),
        appConfig.appUrl,
      ).toString();
      const results = await Promise.allSettled(
        (employees ?? []).map((employee) =>
          sendPolicyUpdatedEmail({
            to: employee.email,
            fullName: employee.full_name,
            policyTitle: policy.title,
            policyUrl,
          }),
        ),
      );
      results.forEach((result) => {
        if (result.status === 'rejected') {
          Logger.error('Failed to send policy update email', result.reason);
        }
      });
    } catch (emailError) {
      Logger.error('Failed to prepare policy update emails', emailError);
    }

    return data;
  });

export const deletePolicy = authActionClient
  .schema(deletePolicySchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase
      .from('policies')
      .delete()
      .eq('id', parsedInput.policyId)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Policy not found');

    return { id: data.id };
  });

const DUPLICATE_ACKNOWLEDGMENT = '23505';

const RLS_VIOLATION = '42501';
const STALE_VERSION_MESSAGE =
  'This policy has been updated since you opened it. Refresh the page and review the latest version before acknowledging.';

export const acknowledgePolicy = authActionClient
  .schema(acknowledgePolicySchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const employeeId = authUser.user?.id;
    if (!employeeId) throw new Error('Unauthorized');

    // Explain a stale version instead of surfacing the raw RLS message; the
    // `with check` remains the guard that enforces it.
    const { data: version, error: versionError } = await supabase
      .from('policy_versions')
      .select('is_active')
      .eq('id', parsedInput.policyVersionId)
      .maybeSingle();
    if (versionError) throw new Error(versionError.message);
    if (!version) throw new Error('Policy version not found');
    if (!version.is_active) throw new Error(STALE_VERSION_MESSAGE);

    const { error } = await supabase.from('policy_acknowledgments').insert({
      employee_id: employeeId,
      policy_version_id: parsedInput.policyVersionId,
    });
    if (error && error.code !== DUPLICATE_ACKNOWLEDGMENT) {
      throw new Error(
        error.code === RLS_VIOLATION ? STALE_VERSION_MESSAGE : error.message,
      );
    }

    return { success: true };
  });

export const markPolicyReviewed = authActionClient
  .schema(markReviewedSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: active, error: activeError } = await supabase
      .from('policy_versions')
      .select('id')
      .eq('policy_id', parsedInput.policyId)
      .eq('is_active', true)
      .single();
    if (activeError) throw new Error(activeError.message);

    const { error } = await supabase.from('policy_reconciliations').upsert({
      policy_id: parsedInput.policyId,
      reconciled_version_id: active.id,
      reconciled_by: authUser.user?.id,
      reconciled_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    return { success: true };
  });
