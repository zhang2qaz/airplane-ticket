// 风险等级判断纯函数
// 规则：
//   1. invoice > actualPaid → 至少 WATCH
//   2. reimbursed > actualPaid → 至少 WATCH
//   3. reimbursed > invoice → ABNORMAL
//   4. netBalance < 0 → 至少 WATCH
//   5. invoice / actualPaid / reimbursed 任一缺失 → 至少 WATCH

import { computeDerived } from "./money";

export type RiskLevel = "NORMAL" | "WATCH" | "ABNORMAL";

export type RiskInput = {
  actualPaidAmount?: number | null;
  invoiceAmount?: number | null;
  reimbursedAmount?: number | null;
  agentFee?: number | null;
  otherCost?: number | null;
  refundAmount?: number | null;
  taxRate?: number | null;
};

export type RiskResult = {
  level: RiskLevel;
  reasons: string[];
};

const isMissing = (v: number | null | undefined): boolean =>
  v === null || v === undefined || Number.isNaN(v as number);

const raise = (current: RiskLevel, target: RiskLevel): RiskLevel => {
  const order: RiskLevel[] = ["NORMAL", "WATCH", "ABNORMAL"];
  return order[Math.max(order.indexOf(current), order.indexOf(target))];
};

export function assessRisk(input: RiskInput): RiskResult {
  const reasons: string[] = [];
  let level: RiskLevel = "NORMAL";

  const actualPaid = input.actualPaidAmount;
  const invoice = input.invoiceAmount;
  const reimbursed = input.reimbursedAmount;

  // 规则 3：reimbursed > invoice → ABNORMAL（最强）
  if (!isMissing(reimbursed) && !isMissing(invoice) && (reimbursed as number) > (invoice as number)) {
    level = raise(level, "ABNORMAL");
    reasons.push("报销金额高于发票金额");
  }

  // 规则 1：invoice > actualPaid → WATCH
  if (!isMissing(invoice) && !isMissing(actualPaid) && (invoice as number) > (actualPaid as number)) {
    level = raise(level, "WATCH");
    reasons.push("发票金额高于真实付款金额");
  }

  // 规则 2：reimbursed > actualPaid → WATCH
  if (!isMissing(reimbursed) && !isMissing(actualPaid) && (reimbursed as number) > (actualPaid as number)) {
    level = raise(level, "WATCH");
    reasons.push("报销金额高于真实付款金额");
  }

  // 规则 4：netBalance < 0 → WATCH
  const { netBalance } = computeDerived(input);
  if (netBalance < 0) {
    level = raise(level, "WATCH");
    reasons.push("实际资金结余为负（未覆盖成本）");
  }

  // 规则 5：三者中任一缺失 → WATCH
  if (isMissing(invoice) || isMissing(actualPaid) || isMissing(reimbursed)) {
    level = raise(level, "WATCH");
    reasons.push("发票/付款/报销金额存在缺失");
  }

  return { level, reasons };
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  NORMAL: "正常",
  WATCH: "关注",
  ABNORMAL: "异常",
};

export const RISK_CLASS: Record<RiskLevel, string> = {
  NORMAL: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  WATCH: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  ABNORMAL: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};
