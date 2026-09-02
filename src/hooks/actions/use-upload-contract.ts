'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CONTRACTS_BUCKET } from '@/hooks/queries/contracts';

import { uploadContract } from '@/actions/contract';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { QueryKeys } from '@/constants/query-keys';
import { type UploadContractFormInput } from '@/schema/contract';

export function useUploadContract(employeeId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ files, note }: UploadContractFormInput) => {
      const supabase = createSupabaseBrowserClient();
      const [file] = files;
      const path = `${employeeId}/${crypto.randomUUID()}.pdf`;

      const { error } = await supabase.storage
        .from(CONTRACTS_BUCKET)
        .upload(path, file, { upsert: false, contentType: 'application/pdf' });
      if (error) throw error;

      const result = await uploadContract({
        employeeId,
        storagePath: path,
        fileName: file.name,
        note,
      });

      if (result?.serverError || result?.validationErrors) {
        await supabase.storage.from(CONTRACTS_BUCKET).remove([path]);
        throw new Error(
          result.serverError ?? 'Some contract details were invalid.',
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.CONTRACTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MY_CONTRACT] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CONTRACT_FILE_URLS],
      });
      onSuccess?.();
    },
    onError: (error: Error) =>
      toast.error('Could not upload the contract', {
        description: error.message,
      }),
  });
}
