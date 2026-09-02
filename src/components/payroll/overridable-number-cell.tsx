'use client';

import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { EditableNumberCell } from './editable-number-cell';

type OverridableNumberCellProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  ariaLabel: string;
  isOverridden: boolean;
  resetAriaLabel: string;
  resetTooltip: string;
  caption?: string;
  onCommit: (value: number | null) => void;
};

export function OverridableNumberCell({
  value,
  min,
  max,
  step,
  disabled,
  ariaLabel,
  isOverridden,
  resetAriaLabel,
  resetTooltip,
  caption,
  onCommit,
}: OverridableNumberCellProps) {
  const input = (
    <div className='flex items-center justify-center gap-1'>
      <EditableNumberCell
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        ariaLabel={ariaLabel}
        onCommit={onCommit}
      />
      {isOverridden && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground'
              disabled={disabled}
              aria-label={resetAriaLabel}
              onClick={() => onCommit(null)}
            >
              <RotateCcw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{resetTooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  if (caption === undefined) return input;

  return (
    <div className='flex flex-col items-center gap-0.5'>
      {input}
      <span className='text-xs text-muted-foreground'>{caption}</span>
    </div>
  );
}
