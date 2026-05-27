import {
  ORDER_STATUS,
  ORDER_STATUS_CLASS,
  REIMBURSEMENT_STATUS,
  REIMBURSEMENT_STATUS_CLASS,
} from "@/lib/enums";
import { RISK_CLASS, RISK_LABEL, type RiskLevel } from "@/lib/risk";

export function RiskChip({ level }: { level: RiskLevel | string }) {
  const lv = (level as RiskLevel) in RISK_LABEL ? (level as RiskLevel) : "NORMAL";
  return <span className={`chip ${RISK_CLASS[lv]}`}>{RISK_LABEL[lv]}</span>;
}

export function OrderStatusChip({ status }: { status: string }) {
  const cls = ORDER_STATUS_CLASS[status] ?? "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
  return <span className={`chip ${cls}`}>{ORDER_STATUS[status] ?? status}</span>;
}

export function ReimbursementStatusChip({ status }: { status: string }) {
  const cls =
    REIMBURSEMENT_STATUS_CLASS[status] ?? "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
  return <span className={`chip ${cls}`}>{REIMBURSEMENT_STATUS[status] ?? status}</span>;
}
