'use client';

import { FolderKanban } from 'lucide-react';
import { toast } from 'sonner';

import {
  useDeleteProject,
  useToggleProjectActive,
} from '@/hooks/actions/use-manage-projects';
import { useProjects } from '@/hooks/queries/projects';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

import { AddProjectDialog } from './add-project-dialog';
import { ProjectRow } from './project-row';
import { SettingsCard } from './settings-card';

import { Project } from '@/types/hrm';

export function ProjectsSettingsCard() {
  const { data: projects, isLoading } = useProjects();

  const { execute: deleteProject } = useDeleteProject(() =>
    toast.success('Project deleted'),
  );

  const { execute: toggleProject } = useToggleProjectActive();

  const handleToggle = (project: Project) => {
    toggleProject({ projectId: project.id, active: !project.active });
  };

  const handleRemove = (project: Project) => {
    deleteProject({ projectId: project.id });
  };

  if (isLoading || !projects) {
    return <Skeleton className='h-64 w-full rounded-xl' />;
  }

  const activeProjects = projects.filter((project) => project.active);
  const inactiveProjects = projects.filter((project) => !project.active);

  return (
    <SettingsCard
      icon={FolderKanban}
      title='Projects'
      description='Company projects — active ones are visible to employees.'
      action={<AddProjectDialog />}
    >
      <div className='flex flex-1 flex-col gap-4 py-4'>
        {activeProjects.length > 0 ? (
          <ul className='flex flex-col gap-2'>
            {activeProjects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onToggle={handleToggle}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        ) : (
          <p className='text-sm text-muted-foreground'>
            No active projects — add one with the button above.
          </p>
        )}

        {inactiveProjects.length > 0 && (
          <Accordion type='single' collapsible>
            <AccordionItem value='inactive' className='border-none'>
              <AccordionTrigger className='py-2 text-xs font-medium text-muted-foreground hover:no-underline'>
                Inactive ({inactiveProjects.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className='flex flex-col gap-2'>
                  {inactiveProjects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      onToggle={handleToggle}
                      onRemove={handleRemove}
                    />
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </SettingsCard>
  );
}
