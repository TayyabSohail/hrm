import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { SystemConfig } from '@/types/hrm';

// The single `system_config` row (RLS `sysconfig_read`: any authenticated user
// can read it, so the nav shell knows which modules are enabled). Mapped onto
// the camelCase `SystemConfig` domain type.
const fetchSystemConfig = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('system_config')
    .select('reimbursements_enabled, updated_at')
    .eq('id', true)
    .single();
  if (error) throw new Error(error.message);
  return {
    reimbursementsEnabled: data.reimbursements_enabled,
    updatedAt: data.updated_at,
  } satisfies SystemConfig;
});

export const useSystemConfig = () =>
  useQuery({
    queryKey: [QueryKeys.SYSTEM_CONFIG],
    queryFn: () => fetchSystemConfig(),
  });
