'use client';

import { FileUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { pdfToPolicyHtml } from '@/lib/pdf-to-html';

type ImportPdfButtonProps = {
  onImported: (html: string, fileName: string) => void;
  size?: 'default' | 'sm';
  className?: string;
};

export function ImportPdfButton({
  onImported,
  size = 'default',
  className,
}: ImportPdfButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFile = async (file: File) => {
    setIsImporting(true);
    try {
      const html = await pdfToPolicyHtml(file);
      onImported(html, file.name.replace(/\.pdf$/i, ''));
      toast.success(
        'PDF imported — review the content and clean up anything the conversion missed.',
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not read this PDF.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        accept='application/pdf'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <Button
        type='button'
        variant='outline'
        size={size}
        iconLeft={FileUp}
        isLoading={isImporting}
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        Import from PDF
      </Button>
    </>
  );
}
