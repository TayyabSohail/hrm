import { type RunPayslipRow } from '@/hooks/queries/payroll';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { CurrentCycleRow } from './current-cycle-row';

type PayslipGridProps = {
  rows: RunPayslipRow[];
  locked: boolean;
  isBusy?: boolean;
  selectedIds: Set<string>;
  onToggleRow: (payslipId: string) => void;
  onToggleAll: () => void;
  onDaysWorkedCommit: (payslipId: string, daysWorked: number | null) => void;
  onOtMultiplierCommit: (payslipId: string, multiplier: number | null) => void;
  onOtHoursCommit: (payslipId: string, hours: number | null) => void;
  onAddCustomField: (
    payslipId: string,
    field: { label: string; amount: number },
  ) => void;
  onRemoveCustomField: (payslipId: string, index: number) => void;
};

export function CurrentCycleTable({
  rows,
  locked,
  isBusy,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onDaysWorkedCommit,
  onOtMultiplierCommit,
  onOtHoursCommit,
  onAddCustomField,
  onRemoveCustomField,
}: PayslipGridProps) {
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  return (
    <div className='overflow-x-auto rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead colSpan={2} className='h-8' />
            <TableHead
              colSpan={5}
              className='h-8 border-l border-border bg-muted/50 text-center text-xs font-semibold uppercase tracking-wide'
            >
              Earnings
            </TableHead>
            <TableHead
              colSpan={3}
              className='h-8 border-l border-border bg-muted/30 text-center text-xs font-semibold uppercase tracking-wide'
            >
              Deductions
            </TableHead>
            <TableHead colSpan={2} className='h-8 border-l border-border' />
          </TableRow>
          <TableRow>
            <TableHead className='w-10'>
              {!locked && (
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                  aria-label='Select all rows'
                />
              )}
            </TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className='border-l border-border text-center'>
              Base Salary
            </TableHead>
            <TableHead className='text-center'>Medical</TableHead>
            <TableHead className='text-center'>OT Rate</TableHead>
            <TableHead className='text-center'>Overtime</TableHead>
            <TableHead className='text-center'>Adjustments</TableHead>
            <TableHead className='border-l border-border text-center'>
              Unpaid Leaves
            </TableHead>
            <TableHead className='text-center'>Tax</TableHead>
            <TableHead className='text-center'>Others</TableHead>
            <TableHead className='border-l border-border text-center'>
              Net Salary
            </TableHead>
            <TableHead className='text-center'>Notification</TableHead>
            <TableHead className='text-center'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <CurrentCycleRow
              key={row.id}
              row={row}
              locked={locked}
              isBusy={isBusy}
              isSelected={selectedIds.has(row.id)}
              onToggleRow={onToggleRow}
              onDaysWorkedCommit={onDaysWorkedCommit}
              onOtMultiplierCommit={onOtMultiplierCommit}
              onOtHoursCommit={onOtHoursCommit}
              onAddCustomField={onAddCustomField}
              onRemoveCustomField={onRemoveCustomField}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
