export const PAYSLIP_LINE_ITEM_KINDS = ['earning', 'deduction'] as const;

export type PayslipLineItemKind = (typeof PAYSLIP_LINE_ITEM_KINDS)[number];

type PayslipLineItemCopy = {
  title: string;
  description: string;
  optionLabel: string;
  labelPlaceholder: string;
  emptyTitle: string;
  noun: string;
};

export const payslipLineItemCopy: Record<
  PayslipLineItemKind,
  PayslipLineItemCopy
> = {
  earning: {
    title: 'Adjustments',
    description: 'Extra amounts paid on top of base salary and overtime.',
    optionLabel: 'Adjustment — adds to earnings',
    labelPlaceholder: 'Bonus',
    emptyTitle: 'No adjustments yet',
    noun: 'Adjustment',
  },
  deduction: {
    title: 'Others',
    description:
      'Amounts taken off this payslip, alongside tax and unpaid leave.',
    optionLabel: 'Other — deducts from net salary',
    labelPlaceholder: 'Loan',
    emptyTitle: 'No deductions yet',
    noun: 'Deduction',
  },
};
