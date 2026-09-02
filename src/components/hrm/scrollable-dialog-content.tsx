'use client';

import * as React from 'react';

import { DialogContent } from '@/components/ui/dialog';

import { cn } from '@/lib/utils';

export const ScrollableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn('max-h-[85vh] overflow-y-auto', className)}
    {...props}
  />
));
ScrollableDialogContent.displayName = 'ScrollableDialogContent';
