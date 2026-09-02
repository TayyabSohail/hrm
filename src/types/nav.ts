import { LucideIcon } from 'lucide-react';

import type { ModuleFlag } from '@/types/hrm';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  requiresFlag?: ModuleFlag;
};

export type NavConfig = {
  roleLabel: string;
  items: NavItem[];
};
