'use client';

import { useCurrentEmployee } from '@/hooks/queries/employees';

import { PageHeader } from '@/components/hrm/page-header';

export function DashboardGreeting() {
  const { data: employee } = useCurrentEmployee();
  const firstName = employee?.full_name?.trim().split(' ')[0];

  return (
    <PageHeader
      title={firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
      description='Your balances, requests, and payslips at a glance.'
    />
  );
}
