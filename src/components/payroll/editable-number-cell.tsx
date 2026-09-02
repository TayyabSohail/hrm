'use client';

import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

type EditableNumberCellProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel: string;
  onCommit: (value: number) => void;
};

export function EditableNumberCell({
  value,
  min = 0,
  max,
  step = 1,
  disabled,
  ariaLabel,
  onCommit,
}: EditableNumberCellProps) {
  const [draft, setDraft] = useState(String(value));

  // Re-sync when the recalc returns a new authoritative value.
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.max(
      min,
      max === undefined ? parsed : Math.min(max, parsed),
    );
    if (clamped === value) {
      setDraft(String(value)); // normalize a no-op edit back to the source
      return;
    }
    onCommit(clamped);
  };

  return (
    <Input
      type='number'
      min={min}
      max={max}
      step={step}
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className='mx-auto h-8 w-20 text-center'
      aria-label={ariaLabel}
    />
  );
}
