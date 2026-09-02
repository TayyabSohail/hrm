'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { uploadContractSchema } from '@/schema/contract';

const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

export const uploadContract = authActionClient
  .schema(uploadContractSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase.rpc('upload_contract', {
      p_employee_id: parsedInput.employeeId,
      p_storage_path: parsedInput.storagePath,
      p_file_name: parsedInput.fileName,
      p_note: parsedInput.note,
    });
    if (error) throw new Error(error.message);

    return data;
  });
