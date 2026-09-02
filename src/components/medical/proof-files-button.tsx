'use client';

import { Paperclip } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { ProofFilesList } from './proof-files-list';

type ProofFilesButtonProps = {
  files: string[];
};

export function ProofFilesButton({ files }: ProofFilesButtonProps) {
  if (!files.length) {
    return <span className='text-muted-foreground'>—</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
        >
          <Paperclip className='size-3.5' />
          {files.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-64 p-2'>
        <ProofFilesList files={files} />
      </PopoverContent>
    </Popover>
  );
}
