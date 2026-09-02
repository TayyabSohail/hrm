'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateProject } from '@/hooks/actions/use-manage-projects';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

import { type CreateProjectInput, createProjectSchema } from '@/schema/project';

export function AddProjectDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '', techStack: '', url: '' },
  });

  const { execute: createProject, isPending } = useCreateProject(() => {
    toast.success('Project added');
    setOpen(false);
  });

  const onSubmit = (values: CreateProjectInput) => {
    createProject(values);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <SheetTrigger asChild>
        <Button size='sm' iconLeft={Plus}>
          New project
        </Button>
      </SheetTrigger>
      <SheetContent className='flex w-full flex-col gap-6 overflow-y-auto sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>New project</SheetTitle>
          <SheetDescription>
            Employees pick active projects when logging overtime.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-1 flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. HRM Frontend' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='What the project is about'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='techStack'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech stack (comma separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Next.js, TypeScript, Supabase'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='https://github.com/…' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className='mt-auto'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={isPending}>
                Add project
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
