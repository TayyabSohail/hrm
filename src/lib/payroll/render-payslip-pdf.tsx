import { renderToBuffer } from '@react-pdf/renderer';
import 'server-only';

import { PayslipPdfDocument } from '@/components/payroll/payslip-pdf-document';

import { Payslip } from '@/types/hrm';

export const payslipFileName = (payslip: Payslip) =>
  `payslip-${payslip.cycleMonth}.pdf`;

export const renderPayslipPdf = (payslip: Payslip): Promise<Buffer> =>
  renderToBuffer(<PayslipPdfDocument payslip={payslip} />);
