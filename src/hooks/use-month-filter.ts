import { useMemo, useState } from 'react';

export function useMonthFilter<T>(
  items: T[] | undefined,
  getDate: (item: T) => string,
  initialMonth = 'all',
) {
  const [month, setMonth] = useState(initialMonth);

  const filtered = useMemo(() => {
    if (month === 'all') return items ?? [];
    return (items ?? []).filter((item) => getDate(item).startsWith(month));
  }, [items, getDate, month]);

  return { month, setMonth, filtered };
}
