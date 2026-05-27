// 金额计算纯函数 —— 所有空值按 0 处理，避免 NaN
// 单位：人民币元，保留 2 位小数（仅显示层）

export type MoneyInput = {
  actualPaidAmount?: number | null;
  invoiceAmount?: number | null;
  reimbursedAmount?: number | null;
  agentFee?: number | null;
  otherCost?: number | null;
  refundAmount?: number | null;
  taxRate?: number | null;
};

export type MoneyDerived = {
  taxCost: number;
  totalActualCost: number;
  reimbursementDifference: number;
  netBalance: number;
};

const n = (v: number | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v !== "number" || Number.isNaN(v)) return 0;
  return v;
};

const round2 = (v: number): number => Math.round(v * 100) / 100;

export function computeDerived(input: MoneyInput): MoneyDerived {
  const actualPaid = n(input.actualPaidAmount);
  const invoice = n(input.invoiceAmount);
  const reimbursed = n(input.reimbursedAmount);
  const agentFee = n(input.agentFee);
  const otherCost = n(input.otherCost);
  const refund = n(input.refundAmount);
  const taxRate = n(input.taxRate);

  const taxCost = invoice * taxRate;
  const totalActualCost = actualPaid + agentFee + otherCost + taxCost - refund;
  const reimbursementDifference = reimbursed - actualPaid;
  const netBalance = reimbursed - totalActualCost;

  return {
    taxCost: round2(taxCost),
    totalActualCost: round2(totalActualCost),
    reimbursementDifference: round2(reimbursementDifference),
    netBalance: round2(netBalance),
  };
}

export const formatCNY = (v: number | null | undefined): string => {
  const x = n(v);
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(x);
};

export const formatNumber2 = (v: number | null | undefined): string => {
  const x = n(v);
  return x.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
