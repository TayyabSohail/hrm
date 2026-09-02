'use server';

import { format } from 'date-fns';

import {
  payslipFileName,
  renderPayslipPdf,
} from '@/lib/payroll/render-payslip-pdf';
import { toCustomFields, toPayslip } from '@/lib/payroll/to-payslip';
import { sendInvoiceEmail } from '@/lib/resend/send-invoice-emails';
import { authActionClient } from '@/lib/server/safe-action';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Logger from '@/utils/logger';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import {
  addCustomFieldSchema,
  createRunSchema,
  type CustomField,
  overrideDaysWorkedSchema,
  overrideOtHoursSchema,
  overrideOtMultiplierSchema,
  removeCustomFieldSchema,
  runIdSchema,
  sendInvoiceSchema,
  updatePayrollSettingsSchema,
} from '@/schema/payroll';

// Defense in depth: RLS and each RPC's own `is_admin()` guard enforce the same thing at the database.
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

async function dispatchInvoices(payslipIds: string[]) {
  if (payslipIds.length === 0) return { sent: 0, failed: 0 };

  const { data: rows, error } = await supabaseAdmin
    .from('payslips')
    .select('*, employees(full_name, email)')
    .in('id', payslipIds);
  if (error) throw new Error(error.message);

  const payslipsUrl = new URL(
    paths.employee.payslips,
    appConfig.appUrl,
  ).toString();

  const results = await Promise.allSettled(
    (rows ?? []).map(async (row) => {
      const to = row.employees?.email;
      if (!to) throw new Error(`Payslip ${row.id} has no employee email`);

      const payslip = toPayslip(row);
      const content = await renderPayslipPdf(payslip);

      await sendInvoiceEmail({
        to,
        fullName: payslip.employeeName || null,
        cycleLabel: format(`${payslip.cycleMonth}-01`, 'MMMM yyyy'),
        payslipsUrl,
        pdf: { filename: payslipFileName(payslip), content },
      });
    }),
  );

  // Stamp each payslip so the UI can surface per-row sent/failed status.
  const statusWrites = await Promise.allSettled(
    (rows ?? []).map((row, index) => {
      const result = results[index];
      const attempts = (row.notification_attempts ?? 0) + 1;

      if (result.status === 'fulfilled') {
        return supabaseAdmin
          .from('payslips')
          .update({
            notification_status: 'sent',
            notification_sent_at: new Date().toISOString(),
            notification_attempts: attempts,
            notification_last_error: null,
          })
          .eq('id', row.id);
      }

      Logger.error('Failed to send invoice email', result.reason);
      return supabaseAdmin
        .from('payslips')
        .update({
          notification_status: 'failed',
          notification_attempts: attempts,
          notification_last_error: String(
            result.reason?.message ?? 'Unknown error',
          ).slice(0, 1024),
        })
        .eq('id', row.id);
    }),
  );

  statusWrites.forEach((write) => {
    const error =
      write.status === 'rejected' ? write.reason : write.value.error;
    if (error)
      Logger.error('Failed to update payslip notification status', error);
  });

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  return { sent, failed: results.length - sent };
}

// Derived server-side so a client can never spoof `days_in_month`, which drives proration.
const daysInMonth = (periodMonth: string) => {
  const [year, month] = periodMonth.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

export const updatePayrollSettings = authActionClient
  .schema(updatePayrollSettingsSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const patch: Record<string, number> = {};
    if (parsedInput.overtimeMultiplier !== undefined)
      patch.ot_multiplier_default = parsedInput.overtimeMultiplier;
    if (parsedInput.leavePoolDays !== undefined)
      patch.leave_pool_days = parsedInput.leavePoolDays;
    if (parsedInput.medicalMonthlyAccrual !== undefined)
      patch.medical_accrual_monthly = parsedInput.medicalMonthlyAccrual;
    if (parsedInput.medicalBalanceCap !== undefined)
      patch.medical_cap = parsedInput.medicalBalanceCap;
    if (parsedInput.taxRatePercent !== undefined)
      patch.tax_rate_percent = parsedInput.taxRatePercent;

    const employeeScope = parsedInput.employeeScope ?? 'defaults';

    const { error } = await supabase
      .from('payroll_settings')
      .update(patch)
      .eq('id', true);
    if (error) throw new Error(error.message);

    // A null per-employee allowance inherits the global setting above; scope
    // 'all' instead stamps these values onto every employee.
    let employeesUpdated = 0;
    if (employeeScope === 'all') {
      if (
        parsedInput.leavePoolDays === undefined ||
        parsedInput.medicalMonthlyAccrual === undefined ||
        parsedInput.medicalBalanceCap === undefined ||
        parsedInput.overtimeMultiplier === undefined
      ) {
        throw new Error(
          'All allowance settings are required when applying them to every employee.',
        );
      }

      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('role', 'employee');
      if (employeesError) throw new Error(employeesError.message);

      const rows = (employees ?? []).map((employee) => ({
        employee_id: employee.id,
        leave_pool_days_override: parsedInput.leavePoolDays,
        medical_accrual_monthly_override: parsedInput.medicalMonthlyAccrual,
        medical_cap_override: parsedInput.medicalBalanceCap,
        ot_multiplier_override: parsedInput.overtimeMultiplier,
      }));

      if (rows.length > 0) {
        const { error: overridesError } = await supabase
          .from('employment_details')
          .upsert(rows, { onConflict: 'employee_id' });
        if (overridesError) throw new Error(overridesError.message);
      }
      employeesUpdated = rows.length;
    }

    return { updated: Object.keys(patch), employeesUpdated, employeeScope };
  });

export const createRun = authActionClient
  .schema(createRunSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase
      .from('payroll_runs')
      .insert({
        period_month: parsedInput.period_month,
        days_in_month: daysInMonth(parsedInput.period_month),
        status: 'open',
      })
      .select('id, period_month')
      .single();

    // Unique(period_month) — the run exists; return it so create stays
    // idempotent from the UI's view.
    if (error) {
      if (error.code === '23505') {
        const { data: existing, error: fetchError } = await supabase
          .from('payroll_runs')
          .select('id, period_month')
          .eq('period_month', parsedInput.period_month)
          .single();
        if (fetchError) throw new Error(fetchError.message);
        return existing;
      }
      throw new Error(error.message);
    }

    return data;
  });

export const calculatePayroll = authActionClient
  .schema(runIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.rpc('calculate_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (error) throw new Error(error.message);
    return { run_id: parsedInput.run_id };
  });

export const lockPayroll = authActionClient
  .schema(runIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.rpc('lock_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (error) throw new Error(error.message);
    return { run_id: parsedInput.run_id };
  });

export const unlockPayroll = authActionClient
  .schema(runIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.rpc('unlock_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (error) throw new Error(error.message);
    return { run_id: parsedInput.run_id };
  });

export const sendRunInvoices = authActionClient
  .schema(runIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select('status')
      .eq('id', parsedInput.run_id)
      .single();
    if (runError) throw new Error(runError.message);
    if (run.status !== 'locked')
      throw new Error('Finalize the run before sending notifications.');

    const { data: rows, error: readError } = await supabase
      .from('payslips')
      .select('id')
      .eq('payroll_run_id', parsedInput.run_id);
    if (readError) throw new Error(readError.message);

    const invoices = await dispatchInvoices((rows ?? []).map((row) => row.id));
    return { run_id: parsedInput.run_id, invoices };
  });

export const sendPayslipInvoice = authActionClient
  .schema(sendInvoiceSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: payslip, error } = await supabase
      .from('payslips')
      .select('id, payroll_runs(status)')
      .eq('id', parsedInput.payslip_id)
      .single();
    if (error) throw new Error(error.message);
    if (payslip.payroll_runs?.status !== 'locked')
      throw new Error('Finalize the run before sending invoices.');

    const { failed } = await dispatchInvoices([payslip.id]);
    if (failed > 0)
      throw new Error(
        'Could not send the invoice. Check the employee has a valid email address, then try again.',
      );

    return { payslip_id: payslip.id };
  });

export const overrideDaysWorked = authActionClient
  .schema(overrideDaysWorkedSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: payslip, error: readError } = await supabase
      .from('payslips')
      .select('payroll_run_id, payroll_runs(status)')
      .eq('id', parsedInput.payslip_id)
      .single();
    if (readError) throw new Error(readError.message);
    if (payslip.payroll_runs?.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const { error: updateError } = await supabase
      .from('payslips')
      .update({ days_worked_override: parsedInput.days_worked })
      .eq('id', parsedInput.payslip_id);
    if (updateError) throw new Error(updateError.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: payslip.payroll_run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: payslip.payroll_run_id };
  });

export const overrideOtMultiplier = authActionClient
  .schema(overrideOtMultiplierSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select('status')
      .eq('id', parsedInput.run_id)
      .single();
    if (runError) throw new Error(runError.message);
    if (run.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const { error: updateError } = await supabase
      .from('payslips')
      .update({
        overtime_multiplier_override: parsedInput.overtime_multiplier,
      })
      .eq('payroll_run_id', parsedInput.run_id)
      .in('id', parsedInput.payslip_ids);
    if (updateError) throw new Error(updateError.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: parsedInput.run_id };
  });

export const overrideOtHours = authActionClient
  .schema(overrideOtHoursSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: payslip, error: readError } = await supabase
      .from('payslips')
      .select('payroll_run_id, payroll_runs(status)')
      .eq('id', parsedInput.payslip_id)
      .single();
    if (readError) throw new Error(readError.message);
    if (payslip.payroll_runs?.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const { error: updateError } = await supabase
      .from('payslips')
      .update({ overtime_hours_override: parsedInput.overtime_hours })
      .eq('id', parsedInput.payslip_id);
    if (updateError) throw new Error(updateError.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: payslip.payroll_run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: payslip.payroll_run_id };
  });

export const addPayslipCustomField = authActionClient
  .schema(addCustomFieldSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select('status')
      .eq('id', parsedInput.run_id)
      .single();
    if (runError) throw new Error(runError.message);
    if (run.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const { data: rows, error: readError } = await supabase
      .from('payslips')
      .select('id, custom_fields')
      .eq('payroll_run_id', parsedInput.run_id)
      .in('id', parsedInput.payslip_ids);
    if (readError) throw new Error(readError.message);

    const field: CustomField = {
      label: parsedInput.label,
      amount: parsedInput.amount,
    };
    const results = await Promise.all(
      (rows ?? []).map((row) =>
        supabase
          .from('payslips')
          .update({
            custom_fields: [...toCustomFields(row.custom_fields), field],
          })
          .eq('id', row.id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: parsedInput.run_id };
  });

export const removePayslipCustomField = authActionClient
  .schema(removeCustomFieldSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: payslip, error: readError } = await supabase
      .from('payslips')
      .select('payroll_run_id, custom_fields, payroll_runs(status)')
      .eq('id', parsedInput.payslip_id)
      .single();
    if (readError) throw new Error(readError.message);
    if (payslip.payroll_runs?.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const next = toCustomFields(payslip.custom_fields).filter(
      (_, i) => i !== parsedInput.index,
    );

    const { error: updateError } = await supabase
      .from('payslips')
      .update({ custom_fields: next })
      .eq('id', parsedInput.payslip_id);
    if (updateError) throw new Error(updateError.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: payslip.payroll_run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: payslip.payroll_run_id };
  });
