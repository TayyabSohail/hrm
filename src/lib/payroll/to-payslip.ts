import { type CustomField, isCustomField } from '@/schema/payroll';

import { Payslip } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

export const toCycleMonth = (periodMonth: string) => periodMonth.slice(0, 7);

export const toCustomFields = (value: unknown): CustomField[] =>
  Array.isArray(value) ? value.filter(isCustomField) : [];

export type PayslipDbRow = Tables<'payslips'> & {
  employees?: Pick<Tables<'employees'>, 'full_name'> | null;
};

export function toPayslip(row: PayslipDbRow): Payslip {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employees?.full_name ?? '',
    designation: row.designation ?? '',
    // `period_month` is denormalized onto the payslip; employees can't read
    // payroll_runs (admin-only RLS), so an embed would come back null here.
    cycleMonth: toCycleMonth(row.period_month),
    baseSalary: row.base_salary,
    daysWorked: Number(row.days_worked),
    daysInMonth: row.days_in_month,
    totalBase: row.total_base,
    medical: row.medical,
    overtimeHours: Number(row.overtime_hours),
    overtimeRate: Number(row.overtime_rate),
    overtimeMultiplier: row.overtime_multiplier
      ? Number(row.overtime_multiplier)
      : 0,
    overtimePay: row.overtime_pay,
    taxDeduction: row.tax_deduction,
    customFields: toCustomFields(row.custom_fields),
    total: row.total_pay,
  };
}
