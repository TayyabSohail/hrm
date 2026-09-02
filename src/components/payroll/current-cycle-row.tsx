'use client';

import { type RunPayslipRow, runRowToPayslip } from '@/hooks/queries/payroll';

import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';

import { formatCurrency } from '@/utils/number-functions';

import { CustomFieldsCell } from './custom-fields-cell';
import { OverridableNumberCell } from './overridable-number-cell';
import { PayslipNotificationBadge } from './payslip-notification-badge';
import { SendInvoiceButton } from './send-invoice-button';
import { ViewInvoiceButton } from './view-invoice-button';

type CurrentCycleRowProps = {
  row: RunPayslipRow;
  locked: boolean;
  isBusy?: boolean;
  isSelected: boolean;
  onToggleRow: (payslipId: string) => void;
  onDaysWorkedCommit: (payslipId: string, daysWorked: number | null) => void;
  onOtMultiplierCommit: (payslipId: string, multiplier: number | null) => void;
  onOtHoursCommit: (payslipId: string, hours: number | null) => void;
  onAddCustomField: (
    payslipId: string,
    field: { label: string; amount: number },
  ) => void;
  onRemoveCustomField: (payslipId: string, index: number) => void;
};

export function CurrentCycleRow({
  row,
  locked,
  isBusy,
  isSelected,
  onToggleRow,
  onDaysWorkedCommit,
  onOtMultiplierCommit,
  onOtHoursCommit,
  onAddCustomField,
  onRemoveCustomField,
}: CurrentCycleRowProps) {
  // Adjustments (earnings) and Others (deductions) render disjoint slices of
  // the same custom_fields array; keeping each item's original index lets
  // removal target the right entry.
  const indexedFields = row.customFields.map((field, index) => ({
    field,
    index,
  }));
  const earnedFields = indexedFields.filter(({ field }) => field.amount >= 0);
  const deductedFields = indexedFields.filter(({ field }) => field.amount < 0);
  const unpaidDays = row.daysInMonth - row.daysWorked;
  const unpaidDeduction = row.baseSalary - row.totalBase;

  return (
    <TableRow>
      <TableCell>
        {!locked ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleRow(row.id)}
            aria-label={`Select ${row.employeeName}`}
          />
        ) : null}
      </TableCell>

      <TableCell className='font-medium'>{row.employeeName || '—'}</TableCell>
      <TableCell className='border-l border-border text-center'>
        {formatCurrency(row.baseSalary)}
      </TableCell>
      <TableCell className='text-center'>
        {formatCurrency(row.medical) || '—'}
      </TableCell>
      <TableCell className='text-center'>
        {locked ? (
          `${row.overtimeMultiplier}x`
        ) : (
          <OverridableNumberCell
            value={row.overtimeMultiplier}
            min={0}
            max={9.99}
            step={0.1}
            disabled={isBusy}
            ariaLabel={`Overtime multiplier for ${row.employeeName}`}
            isOverridden={row.overtimeMultiplierOverride !== null}
            resetAriaLabel={`Reset overtime multiplier for ${row.employeeName} to employee configuration`}
            resetTooltip='Overridden — reset to employee configuration'
            onCommit={(multiplier) => onOtMultiplierCommit(row.id, multiplier)}
          />
        )}
      </TableCell>
      <TableCell className='text-center'>
        {locked ? (
          <span className='whitespace-nowrap'>
            {row.overtimeHours}h · {formatCurrency(row.overtimePay) || '—'}
          </span>
        ) : (
          <OverridableNumberCell
            value={row.overtimeHours}
            min={0}
            max={744}
            step={0.5}
            disabled={isBusy}
            ariaLabel={`Overtime hours for ${row.employeeName}`}
            isOverridden={row.overtimeHoursOverride !== null}
            resetAriaLabel={`Reset overtime hours for ${row.employeeName} to the approved logs`}
            resetTooltip='Overridden — reset to approved logs'
            caption={formatCurrency(row.overtimePay) || 'No overtime'}
            onCommit={(hours) => onOtHoursCommit(row.id, hours)}
          />
        )}
      </TableCell>
      <TableCell className='text-center'>
        <div className='flex justify-center'>
          <CustomFieldsCell
            fields={earnedFields.map(({ field }) => field)}
            employeeName={row.employeeName}
            kind='earning'
            disabled={locked}
            isSubmitting={isBusy}
            onAdd={(field) =>
              onAddCustomField(row.id, {
                label: field.label,
                amount: Math.abs(field.amount),
              })
            }
            onRemove={(i) => onRemoveCustomField(row.id, earnedFields[i].index)}
          />
        </div>
      </TableCell>
      <TableCell className='border-l border-border text-center'>
        {locked ? (
          <span className='whitespace-nowrap'>
            {unpaidDays}d · {formatCurrency(unpaidDeduction) || '—'}
          </span>
        ) : (
          <OverridableNumberCell
            value={unpaidDays}
            min={0}
            max={row.daysInMonth}
            step={0.5}
            disabled={isBusy}
            ariaLabel={`Unpaid days for ${row.employeeName}`}
            isOverridden={row.daysWorkedOverride !== null}
            resetAriaLabel={`Reset unpaid days for ${row.employeeName} to approved leave`}
            resetTooltip='Overridden — reset to approved leave'
            caption={formatCurrency(unpaidDeduction) || 'No deduction'}
            onCommit={(unpaid) =>
              onDaysWorkedCommit(
                row.id,
                unpaid === null ? null : row.daysInMonth - unpaid,
              )
            }
          />
        )}
      </TableCell>
      <TableCell className='text-center'>
        {formatCurrency(row.taxDeduction) || '—'}
      </TableCell>
      <TableCell className='text-center'>
        <div className='flex justify-center'>
          <CustomFieldsCell
            fields={deductedFields.map(({ field }) => ({
              label: field.label,
              amount: Math.abs(field.amount),
            }))}
            employeeName={row.employeeName}
            kind='deduction'
            disabled={locked}
            isSubmitting={isBusy}
            onAdd={(field) =>
              onAddCustomField(row.id, {
                label: field.label,
                amount: -Math.abs(field.amount),
              })
            }
            onRemove={(i) =>
              onRemoveCustomField(row.id, deductedFields[i].index)
            }
          />
        </div>
      </TableCell>
      <TableCell className='border-l border-border text-center font-semibold'>
        {formatCurrency(row.totalPay)}
      </TableCell>
      <TableCell className='text-center'>
        <div className='flex items-center justify-center'>
          <PayslipNotificationBadge
            status={row.notificationStatus}
            sentAt={row.notificationSentAt}
            lastError={row.notificationLastError}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className='flex items-center justify-center gap-1'>
          <ViewInvoiceButton payslip={runRowToPayslip(row)} />
          <SendInvoiceButton
            payslipId={row.id}
            employeeName={row.employeeName}
            disabled={!locked}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
