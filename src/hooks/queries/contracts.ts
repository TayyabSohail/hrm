import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authQuery } from '@/lib/client/auth-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { QueryKeys } from '@/constants/query-keys';

import { ContractVersion, EmployeeContract } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

export const CONTRACTS_BUCKET = 'contracts';
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1h — long enough to read a contract

const CONTRACT_COLUMNS = 'version, file_name, storage_path, note, uploaded_at';

type ContractRow = Pick<
  Tables<'contracts'>,
  'version' | 'file_name' | 'storage_path' | 'note' | 'uploaded_at'
>;

const toVersion = (row: ContractRow) =>
  ({
    version: row.version,
    fileName: row.file_name,
    storagePath: row.storage_path,
    note: row.note,
    uploadedAt: row.uploaded_at,
  }) satisfies ContractVersion;

const byVersionAscending = (a: ContractVersion, b: ContractVersion) =>
  a.version - b.version;

const fetchEmployeeContract = authQuery(
  async ({ supabase, params }): Promise<EmployeeContract | null> => {
    const { data, error } = await supabase
      .from('contracts')
      .select(CONTRACT_COLUMNS)
      .eq('employee_id', params.employeeId);
    if (error) throw new Error(error.message);
    if (!data.length) return null;

    return {
      employeeId: params.employeeId,
      versions: data.map(toVersion).sort(byVersionAscending),
    };
  },
  { paramsSchema: z.object({ employeeId: z.string().uuid() }) },
);

const fetchMyContract = authQuery(
  async ({ supabase, user }): Promise<EmployeeContract | null> => {
    const { data, error } = await supabase
      .from('contracts')
      .select(CONTRACT_COLUMNS)
      .eq('employee_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    return { employeeId: user.id, versions: [toVersion(data)] };
  },
);

export const useEmployeeContract = (employeeId: string) =>
  useQuery({
    queryKey: [QueryKeys.CONTRACTS, employeeId],
    queryFn: () => fetchEmployeeContract({ employeeId }),
    enabled: !!employeeId,
  });

export const useMyContract = () =>
  useQuery({
    queryKey: [QueryKeys.MY_CONTRACT],
    queryFn: () => fetchMyContract(),
  });

export const useContractFileUrls = (paths: string[]) =>
  useQuery({
    queryKey: [QueryKeys.CONTRACT_FILE_URLS, paths],
    enabled: paths.length > 0,
    // Keep URLs stable for most of their TTL, and don't refetch on focus —
    // each fetch mints new ones (mirrors useMedicalProofUrls).
    staleTime: (SIGNED_URL_TTL_SECONDS - 5 * 60) * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<Record<string, string>> => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.storage
        .from(CONTRACTS_BUCKET)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      if (error) throw new Error(error.message);

      return Object.fromEntries(
        (data ?? [])
          .filter(
            (item): item is typeof item & { signedUrl: string; path: string } =>
              !!item.signedUrl && !!item.path,
          )
          .map((item) => [item.path, item.signedUrl]),
      );
    },
  });

export const currentContractVersion = (contract: EmployeeContract) =>
  contract.versions[contract.versions.length - 1];
