'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { exportPayoneer } from '@/actions/payroll-export';

import { onError } from '@/lib/show-error-toast';
import { downloadUrl } from '@/utils/download-functions';

import { QueryKeys } from '@/constants/query-keys';

export function useExportPayoneer(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(exportPayoneer, {
    onSuccess: ({ data }) => {
      if (data?.signed_url) {
        const filename = data.file_path.split('/').pop() ?? 'salaries.csv';
        downloadUrl(data.signed_url, filename);
      }
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_EXPORTS] });
      const count = data?.count ?? 0;
      const excluded = data?.excluded ?? 0;
      // Naming the excluded count back is the only confirmation that leaving
      // someone out actually took — the file downloads either way.
      toast.success(
        `Exported ${count} ${count === 1 ? 'payslip' : 'payslips'} for Payoneer`,
        excluded > 0
          ? { description: `${excluded} excluded from this file.` }
          : undefined,
      );
      onSuccess?.();
    },
    onError,
  });
}
