'use client';

import { Receipt, Wallet } from 'lucide-react';

import { useMedicalBalance } from '@/hooks/queries/medical';

import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

type MedicalBalanceCardsProps = {
  employeeId?: string;
};

export function MedicalBalanceCards({ employeeId }: MedicalBalanceCardsProps) {
  const { data: balance, isLoading } = useMedicalBalance(employeeId);

  if (isLoading || !balance) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-40 rounded-xl' />
        <Skeleton className='h-40 rounded-xl' />
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <StatCard
        label='Available Balance'
        value={formatCurrency(balance.available) || '0'}
        icon={Wallet}
        hint={`Cap ${formatCurrency(balance.cap)} · Accrues ${formatCurrency(balance.monthlyAccrual)}/month`}
      />
      <StatCard
        label='Used'
        value={formatCurrency(balance.spent) || '0'}
        icon={Receipt}
        hint='Total approved claims to date'
      />
    </div>
  );
}
