'use client';

import { type Control, type FieldValues, type Path } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

import { MaskedInput } from './masked-input';

export type TextFieldConfig<TName extends string = string> = {
  name: TName;
  label: string;
  placeholder?: string;
  mask?: 'digits' | 'cnic';
  maxLength?: number | ((value: string) => number);
  fullWidth?: boolean;
};

type ControlledTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  config: TextFieldConfig<Path<T>>;
};

export function ControlledTextField<T extends FieldValues>({
  control,
  config,
}: ControlledTextFieldProps<T>) {
  const { name, label, placeholder, mask, maxLength, fullWidth } = config;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = String(field.value ?? '');
        const currentMaxLength =
          typeof maxLength === 'function' ? maxLength(value) : maxLength;
        return (
          <FormItem
            className={cn('flex flex-col', fullWidth && 'sm:col-span-2')}
          >
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {mask ? (
                <MaskedInput
                  mask={mask}
                  maxLength={currentMaxLength}
                  placeholder={placeholder}
                  {...field}
                  value={value}
                />
              ) : (
                <Input
                  maxLength={currentMaxLength}
                  placeholder={placeholder}
                  {...field}
                  value={value}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
