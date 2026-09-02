'use server';

import {
  sendMedicalDecisionEmail,
  sendMedicalSubmittedEmail,
} from '@/lib/resend/send-medical-emails';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import {
  medicalClaimForLabels,
  medicalServiceTypeLabels,
} from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';
import {
  medicalClaimFieldsSchema,
  reviewMedicalSchema,
} from '@/schema/medical';

import { MedicalClaimFor, MedicalServiceType } from '@/types/hrm';

// Defense in depth: RLS enforces the same thing.
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

const medicalSummary = (
  serviceType: MedicalServiceType,
  amount: number,
  claimFor: MedicalClaimFor,
) =>
  `${medicalServiceTypeLabels[serviceType]} · ${formatCurrency(amount)} · ${medicalClaimForLabels[claimFor]}`;

async function notifyAdminsOfMedical(input: {
  employeeId: string;
  summary: string;
  description: string;
}) {
  const [{ data: employee }, { data: admins }] = await Promise.all([
    supabaseAdmin
      .from('employees')
      .select('full_name, email')
      .eq('id', input.employeeId)
      .maybeSingle(),
    supabaseAdmin
      .from('employees')
      .select('full_name, email')
      .eq('role', 'admin')
      .eq('account_status', 'active'),
  ]);

  if (!employee || !admins?.length) return;

  const employeeName = employee.full_name || employee.email;
  const reviewUrl = new URL(paths.admin.approvals, appConfig.appUrl).toString();

  await Promise.all(
    admins.map((admin) =>
      sendMedicalSubmittedEmail({
        to: admin.email,
        adminName: admin.full_name,
        employeeName,
        summary: input.summary,
        description: input.description,
        reviewUrl,
      }),
    ),
  );
}

export const createMedicalClaim = authActionClient
  .schema(medicalClaimFieldsSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('medical_claims')
      .insert({
        employee_id: userId, // RLS: employee_id = auth.uid()
        claim_for: parsedInput.claimFor,
        service_type: parsedInput.serviceType,
        description: parsedInput.description,
        amount: parsedInput.amount,
        expense_date: parsedInput.expenseDate,
        status: 'pending', // RLS with check forces 'pending'
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);

    // The insert has committed, so a notification failure is logged, not
    // thrown — the employee's submit still succeeds.
    try {
      await notifyAdminsOfMedical({
        employeeId: userId,
        summary: medicalSummary(
          parsedInput.serviceType,
          parsedInput.amount,
          parsedInput.claimFor,
        ),
        description: parsedInput.description,
      });
    } catch (notifyError) {
      Logger.error('Failed to notify admins of medical claim', notifyError);
    }

    return data; // { id }
  });

export const reviewMedicalClaim = authActionClient
  .schema(reviewMedicalSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const adminId = authUser.user?.id;
    if (!adminId) throw new Error('Unauthorized');

    const { data: claim, error: claimError } = await supabase
      .from('medical_claims')
      .select('id, employee_id, amount, status, service_type, claim_for')
      .eq('id', parsedInput.id)
      .single();
    if (claimError) throw new Error(claimError.message);

    // Returning early also skips the balance re-check: an already-approved
    // claim is counted in `spent`, so re-reviewing it would throw a misleading
    // "exceeds available balance".
    if (claim.status !== 'pending') {
      return { id: parsedInput.id };
    }

    if (parsedInput.decision === 'approved') {
      // A pending claim never moves the balance, so `available` here excludes
      // this claim.
      const { data: balance, error: balanceError } = await supabase
        .rpc('medical_balance', { p_employee: claim.employee_id })
        .single();
      if (balanceError) throw new Error(balanceError.message);
      if (claim.amount > balance.available) {
        throw new Error(
          `Claim of ${formatCurrency(claim.amount)} exceeds the available balance of ${formatCurrency(balance.available)}`,
        );
      }
    }

    const rejectionReason =
      parsedInput.decision === 'rejected'
        ? (parsedInput.rejectionReason ?? null)
        : null;

    const { data: updated, error } = await supabase
      .from('medical_claims')
      .update({
        status: parsedInput.decision,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', parsedInput.id)
      .eq('status', 'pending')
      .select('id, employee_id, amount, service_type, claim_for');
    if (error) throw new Error(error.message);

    // No matched row (already reviewed or not found) means nothing to email.
    const reviewed = updated?.[0];
    if (reviewed) {
      try {
        const { data: employee } = await supabaseAdmin
          .from('employees')
          .select('email, full_name')
          .eq('id', reviewed.employee_id)
          .maybeSingle();
        if (employee) {
          await sendMedicalDecisionEmail({
            to: employee.email,
            fullName: employee.full_name,
            decision: parsedInput.decision,
            summary: medicalSummary(
              reviewed.service_type,
              reviewed.amount,
              reviewed.claim_for,
            ),
            rejectionReason,
            medicalUrl: new URL(
              paths.employee.medical,
              appConfig.appUrl,
            ).toString(),
          });
        }
      } catch (emailError) {
        Logger.error('Failed to send medical decision email', emailError);
      }
    }

    return { id: parsedInput.id };
  });
