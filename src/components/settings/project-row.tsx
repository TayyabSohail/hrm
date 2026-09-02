'use client';

import { ExternalLink, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

import { Project } from '@/types/hrm';

type ProjectRowProps = {
  project: Project;
  onToggle: (project: Project) => void;
  onRemove: (project: Project) => void;
};

export function ProjectRow({ project, onToggle, onRemove }: ProjectRowProps) {
  return (
    <li
      className={`flex items-start justify-between gap-3 rounded-lg border border-border p-3 ${
        project.active ? '' : 'opacity-70'
      }`}
    >
      <div className='flex min-w-0 flex-col gap-1.5'>
        <div className='flex min-w-0 flex-col'>
          <span className='text-sm font-medium'>{project.name}</span>
          <span className='text-xs text-muted-foreground'>
            {project.description}
          </span>
        </div>
        {project.techStack.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {project.techStack.map((tech) => (
              <Badge key={tech} variant='secondary'>
                {tech}
              </Badge>
            ))}
          </div>
        )}
        {!!project.url && (
          <a
            href={project.url}
            target='_blank'
            rel='noreferrer'
            className='flex w-fit items-center gap-1 text-xs text-primary hover:underline'
          >
            <ExternalLink className='size-3' />
            <span className='truncate'>
              {project.url.replace(/^https?:\/\//, '')}
            </span>
          </a>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-1'>
        <Switch
          checked={project.active}
          onCheckedChange={() => onToggle(project)}
          aria-label={`Mark ${project.name} ${
            project.active ? 'inactive' : 'active'
          }`}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type='button'
              className='flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className='size-3.5' />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {project.name}? This can’t be
                undone, and employees will no longer be able to log overtime
                against it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRemove(project)}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
