import { format } from 'date-fns';

export const PAYONEER_HEADER = [
  'Bank Account Holder Name',
  'Bank Account Number/IBAN',
  'Payoneer Balance to Pay From',
  'Amount to Pay',
  'Amount Recipient Gets',
  'Recipient Bank Account Currency',
  'Payment Reference (Optional)',
  'Transaction Description (Optional)',
] as const;

export const PAYONEER_CSV_MIME = 'text/csv';

const csvField = (value: string | number) => {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (rows: readonly (readonly (string | number)[])[]) =>
  rows.map((row) => row.map(csvField).join(',')).join('\r\n');

export const payoneerFileName = (periodMonth: string, copyNumber = 0) => {
  const month = format(periodMonth, 'MMM-yyyy').toLowerCase();
  return `salaries-${month}${copyNumber ? `(${copyNumber})` : ''}.csv`;
};
