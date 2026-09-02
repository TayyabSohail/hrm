'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `Copied ${label}` : 'Copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      onClick={copy}
      aria-label={label ? `Copy ${label}` : 'Copy'}
      className={cn('size-8 shrink-0 text-muted-foreground', className)}
    >
      {copied ? <Check className='text-primary' /> : <Copy />}
    </Button>
  );
}
