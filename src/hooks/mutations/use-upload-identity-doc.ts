'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { QueryKeys } from '@/constants/query-keys';
import { type DocType } from '@/schema/onboarding';

export function useUploadIdentityDoc(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docType, file }: { docType: DocType; file: File }) => {
      const path = `${userId}/${docType}`; // first segment = uid enforces storage RLS
      const upload = await supabase.storage
        .from('identity-docs')
        .upload(path, file, { upsert: true });
      if (upload.error) throw upload.error;

      const { error } = await supabase.from('employee_documents').upsert(
        {
          employee_id: userId,
          doc_type: docType,
          storage_path: path,
          file_name: file.name,
        },
        { onConflict: 'employee_id,doc_type' },
      );
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.EMPLOYEE_DOCUMENTS, userId],
        }),
        // Refresh the signed-URL preview cache so the new upload shows at once.
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.IDENTITY_DOC_FILES, userId],
        }),
      ]),
    onError: (error: Error) =>
      toast.error('Could not upload the document', {
        description: error.message,
      }),
  });
}
