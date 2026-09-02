'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  BALANCE_CURRENCIES,
  type BalanceCurrency,
  isBalanceCurrency,
} from '@/constants/payroll-export';

type CurrencySelectProps = {
  value: BalanceCurrency;
  onValueChange: (value: BalanceCurrency) => void;
  disabled?: boolean;
  triggerClassName?: string;
};

export function CurrencySelect({
  value,
  onValueChange,
  disabled,
  triggerClassName,
}: CurrencySelectProps) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (isBalanceCurrency(next)) onValueChange(next);
      }}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {BALANCE_CURRENCIES.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
