'use client';

import { useMedicalClaims } from '@/hooks/queries/medical';

import { MedicalClaimsTable } from './medical-claims-table';

type MedicalHistoryTableProps = {
  employeeId?: string;
  month: string;
};

export function MedicalHistoryTable({
  employeeId,
  month,
}: MedicalHistoryTableProps) {
  const { data: claims, isLoading } = useMedicalClaims(employeeId);

  return (
    <MedicalClaimsTable
      claims={claims}
      isLoading={isLoading || !employeeId}
      emptyDescription='Your claims and their status will show up here.'
      title='Recent Claims'
      month={month}
    />
  );
}
