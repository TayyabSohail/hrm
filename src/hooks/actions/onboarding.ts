'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import {
  saveBank,
  savePersonal,
  saveSocials,
  submitOnboarding,
} from '@/actions/onboarding';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

function useInvalidateProfile() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: [QueryKeys.ONBOARDING] });
}

export function useSavePersonal() {
  const invalidateProfile = useInvalidateProfile();
  return useAction(savePersonal, { onSuccess: invalidateProfile, onError });
}

export function useSaveBank() {
  const invalidateProfile = useInvalidateProfile();
  return useAction(saveBank, { onSuccess: invalidateProfile, onError });
}

export function useSaveSocials() {
  const invalidateProfile = useInvalidateProfile();
  return useAction(saveSocials, { onSuccess: invalidateProfile, onError });
}

export function useSubmitOnboarding() {
  const invalidateProfile = useInvalidateProfile();
  return useAction(submitOnboarding, { onSuccess: invalidateProfile, onError });
}
