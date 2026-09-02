import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { Project } from '@/types/hrm';

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  tech_stack: string[] | null;
  url: string | null;
  is_active: boolean;
};
const fetchProjects = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, tech_stack, url, is_active')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data as unknown as ProjectRow[] | null) ?? [])?.map(
    (row) =>
      ({
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        techStack: row.tech_stack ?? [],
        url: row.url ?? '',
        active: row.is_active,
      }) satisfies Project,
  );
});

export const useProjects = () =>
  useQuery({
    queryKey: [QueryKeys.PROJECTS],
    queryFn: () => fetchProjects(),
  });
