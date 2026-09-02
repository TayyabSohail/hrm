import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useEmployees } from '@/hooks/queries/employees';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import {
  ActivePolicy,
  Policy,
  PolicyAcknowledgment,
  PolicyVersion,
} from '@/types/hrm';
const POLICY_COLUMNS = 'id, title, slug, category';
const VERSION_COLUMNS = 'id, version, body_html, published_at, is_active';

type PolicyVersionRow = {
  id: string;
  version: number;
  body_html: string;
  published_at: string;
  is_active: boolean;
};

const toVersion = (row: PolicyVersionRow) =>
  ({
    id: row.id,
    version: row.version,
    contentHtml: row.body_html,
    publishedAt: row.published_at,
    isActive: row.is_active,
  }) satisfies PolicyVersion;

const byVersionAscending = (a: PolicyVersion, b: PolicyVersion) =>
  a.version - b.version;

const fetchPolicies = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('policies')
    .select(`${POLICY_COLUMNS}, policy_versions(${VERSION_COLUMNS})`)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);

  return data.map(
    (row) =>
      ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        category: row.category,
        versions: row.policy_versions.map(toVersion).sort(byVersionAscending),
      }) satisfies Policy,
  );
});

const fetchPolicy = authQuery(
  async ({ supabase, params }): Promise<Policy | null> => {
    const { data, error } = await supabase
      .from('policies')
      .select(`${POLICY_COLUMNS}, policy_versions(${VERSION_COLUMNS})`)
      .eq('id', params.policyId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      category: data.category,
      versions: data.policy_versions.map(toVersion).sort(byVersionAscending),
    };
  },
  { paramsSchema: z.object({ policyId: z.string().uuid() }) },
);

const fetchActivePolicies = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('policy_versions')
    .select(`id, version, published_at, policies(${POLICY_COLUMNS})`)
    .eq('is_active', true)
    .order('published_at', { ascending: false });
  if (error) throw new Error(error.message);

  return data.map(
    (row) =>
      ({
        id: row.policies.id,
        title: row.policies.title,
        slug: row.policies.slug,
        category: row.policies.category,
        versionId: row.id,
        version: row.version,
        publishedAt: row.published_at,
      }) satisfies ActivePolicy,
  );
});

const ACKNOWLEDGMENT_COLUMNS =
  'employee_id, policy_version_id, acknowledged_at, policy_versions(version, policy_id)';

type AcknowledgmentRow = {
  employee_id: string;
  policy_version_id: string;
  acknowledged_at: string;
  policy_versions: { version: number; policy_id: string };
};

const toAcknowledgment = (row: AcknowledgmentRow) =>
  ({
    policyId: row.policy_versions.policy_id,
    employeeId: row.employee_id,
    policyVersionId: row.policy_version_id,
    acknowledgedVersion: row.policy_versions.version,
    acknowledgedAt: row.acknowledged_at,
  }) satisfies PolicyAcknowledgment;

const fetchMyAcknowledgments = authQuery(
  async ({ supabase, user }): Promise<PolicyAcknowledgment[]> => {
    const { data, error } = await supabase
      .from('policy_acknowledgments')
      .select(ACKNOWLEDGMENT_COLUMNS)
      .eq('employee_id', user.id);
    if (error) throw new Error(error.message);

    return data.map(toAcknowledgment);
  },
);
const fetchAllAcknowledgments = authQuery(
  async ({ supabase }): Promise<PolicyAcknowledgment[]> => {
    const { data, error } = await supabase
      .from('policy_acknowledgments')
      .select(ACKNOWLEDGMENT_COLUMNS);
    if (error) throw new Error(error.message);

    return data.map(toAcknowledgment);
  },
);
export const usePolicies = () =>
  useQuery({
    queryKey: [QueryKeys.POLICIES],
    queryFn: () => fetchPolicies(),
  });
export const usePolicy = (policyId: string) =>
  useQuery({
    queryKey: [QueryKeys.POLICIES, policyId],
    queryFn: () => fetchPolicy({ policyId }),
    enabled: !!policyId,
  });

export const useActivePolicies = () =>
  useQuery({
    queryKey: [QueryKeys.ACTIVE_POLICIES],
    queryFn: () => fetchActivePolicies(),
  });
export const useMyPolicyAcknowledgments = () =>
  useQuery({
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS, 'mine'],
    queryFn: () => fetchMyAcknowledgments(),
  });

export const useAllPolicyAcknowledgments = () =>
  useQuery({
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS, 'all'],
    queryFn: () => fetchAllAcknowledgments(),
  });
export const currentVersion = (policy: Policy) =>
  policy.versions.find((version) => version.isActive) ??
  policy.versions[policy.versions.length - 1];
export const previousVersion = (policy: Policy, current: PolicyVersion) =>
  policy.versions.filter((version) => version.version < current.version).at(-1);
export const hasAcknowledged = (
  acknowledgments: PolicyAcknowledgment[],
  policyVersionId: string,
) => acknowledgments.some((ack) => ack.policyVersionId === policyVersionId);
export const latestAcknowledgment = (
  acknowledgments: PolicyAcknowledgment[],
  policyId: string,
) =>
  acknowledgments
    .filter((ack) => ack.policyId === policyId)
    .reduce<
      PolicyAcknowledgment | undefined
    >((best, ack) => (!best || ack.acknowledgedVersion > best.acknowledgedVersion ? ack : best), undefined);
export const usePendingAcknowledgments = () => {
  const { data: policies, isLoading: policiesLoading } = useActivePolicies();
  const { data: acknowledgments, isLoading: acksLoading } =
    useMyPolicyAcknowledgments();

  return {
    data: (policies ?? []).filter(
      (policy) => !hasAcknowledged(acknowledgments ?? [], policy.versionId),
    ),
    isLoading: policiesLoading || acksLoading,
  };
};
export const useUnacknowledgedPolicyCount = () =>
  usePendingAcknowledgments().data.length;

export const useActiveEmployees = () => {
  const { data: employees, isLoading } = useEmployees();
  return {
    data: (employees ?? []).filter((employee) => employee.status === 'active'),
    isLoading,
  };
};
