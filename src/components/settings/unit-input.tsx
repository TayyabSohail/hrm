import * as React from 'react';

import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

type UnitInputProps = React.ComponentProps<'input'> & {
  unit: string;
};

export const UnitInput = React.forwardRef<HTMLInputElement, UnitInputProps>(
  ({ unit, className, ...props }, ref) => (
    <div className='relative'>
      <Input
        ref={ref}
        className={cn('pr-12 text-right font-medium tabular-nums', className)}
        {...props}
      />
      <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground'>
        {unit}
      </span>
    </div>
  ),
);
UnitInput.displayName = 'UnitInput';
