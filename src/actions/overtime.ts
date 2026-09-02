'use server';

import {
  sendOvertimeDecisionEmail,
  sendOvertimeSubmittedEmail,
} from '@/lib/resend/send-overtime-emails';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Logger from '@/utils/logger';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import { overtimeLogSchema, reviewOvertimeSchema } from '@/schema/overtime';

// Defense in depth: RLS enforces the same thing.
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

const overtimeSummary = (hours: number, projectName: string) =>
  `${hours} hr(s) · ${projectName}`;

async function notifyAdminsOfOvertime(input: {
  employeeId: string;
  projectId: string;
  hours: number;
  task: string;
}) {
  const [{ data: employee }, { data: admins }, { data: project }] =
    await Promise.all([
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
      supabaseAdmin
        .from('projects')
        .select('name')
        .eq('id', input.projectId)
        .maybeSingle(),
    ]);

  if (!employee || !admins?.length) return;

  const employeeName = employee.full_name || employee.email;
  const summary = overtimeSummary(input.hours, project?.name ?? 'a project');
  const reviewUrl = new URL(paths.admin.approvals, appConfig.appUrl).toString();

  await Promise.all(
    admins.map((admin) =>
      sendOvertimeSubmittedEmail({
        to: admin.email,
        adminName: admin.full_name,
        employeeName,
        summary,
        task: input.task,
        reviewUrl,
      }),
    ),
  );
}

export const createOvertimeLog = authActionClient
  .schema(overtimeLogSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const userId = authUser.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('overtime_logs')
      .insert({
        employee_id: userId, // RLS: employee_id = auth.uid()
        work_date: parsedInput.date,
        hours: parsedInput.hours,
        project_id: parsedInput.projectId,
        task: parsedInput.task,
        status: 'pending', // RLS with check forces 'pending'
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);

    // The insert has committed, so a notification failure is logged, not
    // thrown — the employee's submit still succeeds.
    try {
      await notifyAdminsOfOvertime({
        employeeId: userId,
        projectId: parsedInput.projectId,
        hours: parsedInput.hours,
        task: parsedInput.task,
      });
    } catch (notifyError) {
      Logger.error('Failed to notify admins of overtime log', notifyError);
    }

    return data;
  });

export const reviewOvertimeLog = authActionClient
  .schema(reviewOvertimeSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const adminId = authUser.user?.id;
    if (!adminId) throw new Error('Unauthorized');

    const rejectionReason =
      parsedInput.decision === 'rejected'
        ? (parsedInput.rejectionReason ?? null)
        : null;

    const { data, error } = await supabase
      .from('overtime_logs')
      .update({
        status: parsedInput.decision,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', parsedInput.id)
      .eq('status', 'pending')
      .select('id, employee_id, hours, projects(name)');
    if (error) throw new Error(error.message);

    // No matched row (already reviewed or not found) means nothing to email.
    const reviewed = data?.[0];
    if (reviewed) {
      try {
        const { data: employee } = await supabaseAdmin
          .from('employees')
          .select('email, full_name')
          .eq('id', reviewed.employee_id)
          .maybeSingle();
        if (employee) {
          await sendOvertimeDecisionEmail({
            to: employee.email,
            fullName: employee.full_name,
            decision: parsedInput.decision,
            summary: overtimeSummary(
              Number(reviewed.hours),
              reviewed.projects?.name ?? 'a project',
            ),
            rejectionReason,
            overtimeUrl: new URL(
              paths.employee.overtime,
              appConfig.appUrl,
            ).toString(),
          });
        }
      } catch (emailError) {
        Logger.error('Failed to send overtime decision email', emailError);
      }
    }

    return { id: parsedInput.id };
  });
