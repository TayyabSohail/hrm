'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';

import { formatCnic, onlyDigits } from '@/utils/format-functions';

type MaskedInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange'
> & {
  value?: string | null;
  onChange: (value: string) => void;
  mask?: 'digits' | 'cnic';
};

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, maxLength, ...props }, ref) => {
    const transform = (raw: string): string => {
      if (mask === 'cnic') return formatCnic(raw);
      if (mask === 'digits') {
        return maxLength
          ? onlyDigits(raw).slice(0, maxLength)
          : onlyDigits(raw);
      }
      return maxLength ? raw.slice(0, maxLength) : raw;
    };

    return (
      <Input
        ref={ref}
        inputMode={mask ? 'numeric' : undefined}
        maxLength={mask === 'cnic' ? 15 : maxLength}
        value={value ?? ''}
        onChange={(event) => onChange(transform(event.target.value))}
        {...props}
      />
    );
  },
);

MaskedInput.displayName = 'MaskedInput';
