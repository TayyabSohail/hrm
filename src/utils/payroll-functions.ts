import { currentMonth, nextMonth } from '@/utils/date-functions';

import type { Payslip } from '@/types/hrm';
const MAX_MONTHS_AHEAD = 120;

export const firstAvailableMonth = (takenMonths: string[]) => {
  let month = currentMonth();
  for (let i = 0; i < MAX_MONTHS_AHEAD && takenMonths.includes(month); i++) {
    month = nextMonth(month);
  }
  return month;
};
export const calcTotalBase = (
  baseSalary: number,
  daysWorked: number,
  daysInMonth: number,
) => Math.round((baseSalary * daysWorked) / daysInMonth);

export const calcOvertimePay = (
  baseSalary: number,
  workingHours: number,
  overtimeHours: number,
  overtimeMultiplier: number,
) =>
  Math.round((baseSalary / workingHours) * overtimeMultiplier * overtimeHours);
export const calcPayslipTotal = (
  totalBase: number,
  medical: number,
  overtimePay: number,
  taxDeduction: number,
  customFields: Payslip['customFields'],
) => {
  const customTotal = customFields.reduce(
    (sum, field) => sum + field.amount,
    0,
  );
  return Math.round(
    totalBase + medical + overtimePay - taxDeduction + customTotal,
  );
};
