import { Wallet } from 'lucide-react';
import { Metadata } from 'next';

import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';

export const metadata: Metadata = { title: 'Reimbursements' };

export default function ReimbursementsPage() {
  return (
    <>
      <PageHeader
        title='Reimbursements'
        description='Expense reimbursement requests and approvals.'
      />
      <EmptyState
        icon={Wallet}
        title='Reimbursements module coming soon'
        description='This module is enabled but its screens ship in a later phase. Toggle it off under Settings → Module Toggles to hide it again.'
      />
    </>
  );
}
