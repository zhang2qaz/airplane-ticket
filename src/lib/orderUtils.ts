// 订单写入前的数据规整：把字符串/空值转成 Prisma 期望的形态，并计算派生字段

import { computeDerived } from "./money";
import { assessRisk } from "./risk";
import { parseDateInput } from "./dates";

type RawInput = Record<string, unknown>;

const toNumberOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (Number.isNaN(n)) return null;
  return n;
};

const toStringOrNull = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const toDateOrNull = (v: unknown): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  return parseDateInput(String(v));
};

const ORDER_STATUSES = ["BOOKED", "TICKETED", "CANCELED", "REFUNDED", "COMPLETED"];
const REIMB_STATUSES = ["PENDING", "SUBMITTED", "REIMBURSED", "REJECTED"];
const INVOICE_TYPES = ["GENERAL", "SPECIAL", "ELECTRONIC", "ITINERARY", "OTHER"];

const pickEnum = (v: unknown, allowed: string[], fallback: string): string => {
  const s = toStringOrNull(v);
  if (!s) return fallback;
  return allowed.includes(s) ? s : fallback;
};

const pickEnumOrNull = (v: unknown, allowed: string[]): string | null => {
  const s = toStringOrNull(v);
  if (!s) return null;
  return allowed.includes(s) ? s : null;
};

/**
 * 将 raw 输入（来自表单或 API）规整为 Prisma 接受的形态。
 * 同时计算派生字段（taxCost / reimbursementDifference / netBalance / riskLevel）。
 */
export function buildOrderData(raw: RawInput) {
  const actualPaidAmount = toNumberOrNull(raw.actualPaidAmount);
  const invoiceAmount = toNumberOrNull(raw.invoiceAmount);
  const reimbursedAmount = toNumberOrNull(raw.reimbursedAmount);
  const agentFee = toNumberOrNull(raw.agentFee);
  const otherCost = toNumberOrNull(raw.otherCost);
  const refundAmount = toNumberOrNull(raw.refundAmount);
  const taxRate = toNumberOrNull(raw.taxRate);

  const derived = computeDerived({
    actualPaidAmount,
    invoiceAmount,
    reimbursedAmount,
    agentFee,
    otherCost,
    refundAmount,
    taxRate,
  });

  const risk = assessRisk({
    actualPaidAmount,
    invoiceAmount,
    reimbursedAmount,
    agentFee,
    otherCost,
    refundAmount,
    taxRate,
  });

  const agentIdRaw = toStringOrNull(raw.agentId);

  return {
    orderNo: (toStringOrNull(raw.orderNo) ?? "").trim(),
    bookingDate: toDateOrNull(raw.bookingDate),
    passengerName: (toStringOrNull(raw.passengerName) ?? "").trim(),
    route: (toStringOrNull(raw.route) ?? "").trim(),
    departureDate: toDateOrNull(raw.departureDate),
    returnDate: toDateOrNull(raw.returnDate),
    airline: toStringOrNull(raw.airline),
    cabinClass: toStringOrNull(raw.cabinClass),
    pnr: toStringOrNull(raw.pnr),
    ticketNo: toStringOrNull(raw.ticketNo),
    agentId: agentIdRaw,

    orderStatus: pickEnum(raw.orderStatus, ORDER_STATUSES, "BOOKED"),
    reimbursementStatus: pickEnum(raw.reimbursementStatus, REIMB_STATUSES, "PENDING"),

    actualPaidAmount,
    invoiceAmount,
    reimbursedAmount,
    agentFee,
    otherCost,
    refundAmount,
    taxRate,

    taxCost: derived.taxCost,
    reimbursementDifference: derived.reimbursementDifference,
    netBalance: derived.netBalance,

    invoiceTitle: toStringOrNull(raw.invoiceTitle),
    taxNo: toStringOrNull(raw.taxNo),
    invoiceType: pickEnumOrNull(raw.invoiceType, INVOICE_TYPES),
    invoiceNo: toStringOrNull(raw.invoiceNo),
    invoiceDate: toDateOrNull(raw.invoiceDate),
    reimbursementDate: toDateOrNull(raw.reimbursementDate),
    reimbursementRemark: toStringOrNull(raw.reimbursementRemark),

    riskLevel: risk.level,
    remark: toStringOrNull(raw.remark),
  };
}

export function validateOrder(data: ReturnType<typeof buildOrderData>): string | null {
  if (!data.orderNo) return "订单号必填";
  if (!data.passengerName) return "出行人必填";
  if (!data.route) return "航线必填";
  return null;
}
