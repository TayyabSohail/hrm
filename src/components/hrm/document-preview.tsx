'use client';

import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type IdentityDocFile } from '@/hooks/queries/onboarding';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

type DocumentPreviewProps = {
  file?: IdentityDocFile;
  label: string;
  isLoading?: boolean;
  className?: string;
};

// A fixed, well-proportioned frame. Content is *fitted* inside it (never cropped
// or scrolled): images via object-contain, PDFs via the viewer's `view=Fit`.
const FRAME =
  'relative flex h-56 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30';

export function DocumentPreview({
  file,
  label,
  isLoading,
  className,
}: DocumentPreviewProps) {
  const url = file?.url;
  const isPdf = !!file && file.mimeType.includes('pdf');
  const [loaded, setLoaded] = useState(false);

  // A fresh signed URL (e.g. after replacing the file) is a new document to
  // load, so fall back to the skeleton until it has rendered again.
  useEffect(() => {
    setLoaded(false);
  }, [url]);

  if (!isLoading && !url) return null;

  const fade = cn(
    'transition-opacity duration-200',
    loaded ? 'opacity-100' : 'opacity-0',
  );

  return (
    <div className={cn(FRAME, className)}>
      {(isLoading || !loaded) && <Skeleton className='absolute inset-0' />}

      {url &&
        (isPdf ? (
          <iframe
            title={label}
            // Fit the whole page to the frame and hide the viewer chrome so
            // the preview shows the document, not a scrollable mini-app.
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
            onLoad={() => setLoaded(true)}
            className={cn('h-full w-full', fade)}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- private signed Supabase URL, not a static asset; the Next image optimizer must not proxy/cache identity documents */
          <img
            src={url}
            alt={label}
            onLoad={() => setLoaded(true)}
            className={cn('max-h-full max-w-full object-contain', fade)}
          />
        ))}

      {url && loaded && (
        <Button
          asChild
          size='sm'
          variant='secondary'
          iconLeft={ExternalLink}
          className='absolute bottom-2 right-2 shadow-sm'
        >
          <a href={url} target='_blank' rel='noreferrer'>
            Open
            <span className='sr-only'> {label}</span>
          </a>
        </Button>
      )}
    </div>
  );
}
