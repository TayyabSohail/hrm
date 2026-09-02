'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

import { env } from '@/env';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      window.location.hostname === 'localhost';
    if (!env.NEXT_PUBLIC_POSTHOG_KEY || isDevelopment) return;

    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      capture_pageleave: true,
      capture_performance: true,
      person_profiles: 'identified_only',
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask], [data-ph-mask] *',
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
