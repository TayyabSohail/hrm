'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ScrollableDialogContent } from '@/components/hrm/scrollable-dialog-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import { type RejectReasonInput, rejectReasonSchema } from '@/schema/common';

type RejectRequestDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: (reason: string) => boolean | void | Promise<boolean | void>;
};

export function RejectRequestDialog({
  trigger,
  title,
  description,
  onConfirm,
}: RejectRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<RejectReasonInput>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: { reason: '' },
  });

  const onSubmit = async (values: RejectReasonInput) => {
    const result = await onConfirm(values.reason);
    if (result === false) return; // failed — keep open with the reason intact
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ScrollableDialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for rejection</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='Explain why this request is being rejected…'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='destructive'
                isLoading={form.formState.isSubmitting}
              >
                Reject request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  );
}
