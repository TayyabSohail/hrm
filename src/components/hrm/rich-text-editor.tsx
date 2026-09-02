'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';

export const RichTextEditor = dynamic(
  () => import('./rich-text-editor-impl').then((mod) => mod.RichTextEditorImpl),
  {
    ssr: false,
    loading: () => <Skeleton className='h-56 w-full rounded-md' />,
  },
);
