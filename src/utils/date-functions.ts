import { format, formatDistanceToNow } from 'date-fns';

const DATE_FORMAT = 'dd/MM/yy';
const TIME_FORMAT = 'HH:mm:ss a';
const MONTH_FORMAT = 'yyyy-MM';

// The current month as 'YYYY-MM', in the viewer's own timezone.
export function currentMonth(): string {
  return format(new Date(), MONTH_FORMAT);
}

// The current year as 'YYYY', in the viewer's own timezone.
export function currentYear(): string {
  return format(new Date(), 'yyyy');
}

export function nextMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return monthNumber === 12
    ? `${year + 1}-01`
    : `${year}-${String(monthNumber + 1).padStart(2, '0')}`;
}

export function formatTimestamp(
  timestamp: number | Date | string | undefined | null,
) {
  if (!timestamp) return '';
  return format(timestamp, `${DATE_FORMAT} ${TIME_FORMAT}`);
}

export function formatDate(
  timestamp: number | Date | string | undefined | null,
) {
  if (!timestamp) return '';
  return format(timestamp, DATE_FORMAT);
}

export function formatTime(
  timestamp: number | Date | string | undefined | null,
): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return format(date, TIME_FORMAT);
}

export function formatTimeAgo(
  timestamp: number | Date | string | undefined | null,
): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
}
