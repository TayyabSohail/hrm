'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useExportPayoneer } from '@/hooks/actions/use-export-payoneer';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  BALANCE_CURRENCIES,
  type BalanceCurrency,
  DEFAULT_BALANCE_CURRENCY,
} from '@/constants/payroll-export';

import { CurrencySelect } from './currency-select';
import { PayoneerBalanceBreakdown } from './payoneer-balance-breakdown';
import { PayoneerExportRow } from './payoneer-export-row';

import { type PayoneerExportRow as PayoneerExportRowData } from '@/types/hrm';

type ExportPayoneerSheetProps = {
  runId: string;
  rows: PayoneerExportRowData[];
  disabled?: boolean;
};

export function ExportPayoneerSheet({
  runId,
  rows,
  disabled,
}: ExportPayoneerSheetProps) {
  const [open, setOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Record<string, BalanceCurrency>>(
    {},
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [bulkCurrency, setBulkCurrency] = useState<BalanceCurrency>(
    DEFAULT_BALANCE_CURRENCY,
  );

  const exportAction = useExportPayoneer(() => {
    setOpen(false);
    setSelectedIds(new Set());
    setExcludedIds(new Set());
  });

  const currencyFor = (employeeId: string) =>
    currencies[employeeId] ?? DEFAULT_BALANCE_CURRENCY;

  const toggleExcluded = (employeeId: string) =>
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });

  const toggleRow = (employeeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === rows.length
        ? new Set()
        : new Set(rows.map((row) => row.employeeId)),
    );
  };

  const setCurrencyFor = (employeeId: string, currency: BalanceCurrency) =>
    setCurrencies((prev) => ({ ...prev, [employeeId]: currency }));

  const applyBulkCurrency = () => {
    setCurrencies((prev) => {
      const next = { ...prev };
      selectedIds.forEach((employeeId) => {
        next[employeeId] = bulkCurrency;
      });
      return next;
    });
    toast.success(
      `Set ${bulkCurrency} for ${selectedIds.size} ${
        selectedIds.size === 1 ? 'employee' : 'employees'
      }`,
    );
  };

  const includedRows = rows.filter((row) => !excludedIds.has(row.employeeId));

  // Group by source balance: how many employees each balance pays, and the
  // total PKR those employees receive. The card converts each total into its
  // own currency for display. Excluded people aren't paid from any balance in
  // this file, so they're out of the breakdown too.
  const breakdown = BALANCE_CURRENCIES.map((currency) => {
    const inCurrency = includedRows.filter(
      (row) => currencyFor(row.employeeId) === currency,
    );
    return {
      currency,
      count: inCurrency.length,
      totalPkr: inCurrency.reduce((sum, row) => sum + row.total, 0),
    };
  }).filter((group) => group.count > 0);

  const handleExport = () => {
    const currencyByEmployee = Object.fromEntries(
      rows.map((row) => [row.employeeId, currencyFor(row.employeeId)]),
    );
    exportAction.execute({
      run_id: runId,
      currencyByEmployee,
      excludedEmployeeIds: [...excludedIds],
    });
  };

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='outline' disabled={disabled}>
          Export for Payoneer
        </Button>
      </SheetTrigger>
      <SheetContent className='flex w-full flex-col gap-4 overflow-y-auto sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Export for Payoneer</SheetTitle>
          <SheetDescription>
            Choose the Payoneer balance to pay each employee from. The recipient
            bank account is always PKR, and the amount is the locked payslip
            total. Leave anyone out who isn&apos;t being paid through Payoneer
            this month — it only affects this file.
          </SheetDescription>
        </SheetHeader>

        {selectedIds.size > 0 && (
          <div className='flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2'>
            <span className='text-sm text-muted-foreground'>
              {selectedIds.size} selected
            </span>
            <CurrencySelect
              value={bulkCurrency}
              onValueChange={setBulkCurrency}
              triggerClassName='h-8 w-28'
            />
            <Button type='button' size='sm' onClick={applyBulkCurrency}>
              Apply to selected
            </Button>
          </div>
        )}

        <div className='rounded-lg border border-border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label='Select all rows'
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className='text-center'>Amount (PKR)</TableHead>
                <TableHead className='text-center'>Pay from</TableHead>
                <TableHead className='w-16 text-center'>In file</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <PayoneerExportRow
                  key={row.employeeId}
                  row={row}
                  currency={currencyFor(row.employeeId)}
                  isSelected={selectedIds.has(row.employeeId)}
                  isExcluded={excludedIds.has(row.employeeId)}
                  onToggleSelected={toggleRow}
                  onToggleExcluded={toggleExcluded}
                  onCurrencyChange={setCurrencyFor}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {breakdown.length > 0 && (
          <PayoneerBalanceBreakdown groups={breakdown} />
        )}

        <SheetFooter className='mt-auto items-center gap-2 sm:justify-between'>
          <span className='text-sm text-muted-foreground'>
            {excludedIds.size > 0
              ? `${includedRows.length} of ${rows.length} in this file`
              : `${rows.length} ${rows.length === 1 ? 'employee' : 'employees'}`}
          </span>
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={exportAction.isPending}
              disabled={includedRows.length === 0}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
