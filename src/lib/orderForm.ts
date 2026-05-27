// 可在 server 和 client 共用的纯工具（OrderForm.tsx 是 "use client"，不能从 server 直接调用其导出）

import { toDateInput } from "./dates";

export type OrderFormValues = {
  id?: string;
  orderNo: string;
  bookingDate: string;
  passengerName: string;
  route: string;
  departureDate: string;
  returnDate: string;
  airline: string;
  cabinClass: string;
  pnr: string;
  ticketNo: string;
  agentId: string;
  orderStatus: string;
  reimbursementStatus: string;
  actualPaidAmount: string;
  invoiceAmount: string;
  reimbursedAmount: string;
  agentFee: string;
  otherCost: string;
  refundAmount: string;
  taxRate: string;
  invoiceTitle: string;
  taxNo: string;
  invoiceType: string;
  invoiceNo: string;
  invoiceDate: string;
  reimbursementDate: string;
  reimbursementRemark: string;
  remark: string;
};

export const emptyForm = (): OrderFormValues => ({
  orderNo: "",
  bookingDate: "",
  passengerName: "",
  route: "",
  departureDate: "",
  returnDate: "",
  airline: "",
  cabinClass: "",
  pnr: "",
  ticketNo: "",
  agentId: "",
  orderStatus: "BOOKED",
  reimbursementStatus: "PENDING",
  actualPaidAmount: "",
  invoiceAmount: "",
  reimbursedAmount: "",
  agentFee: "",
  otherCost: "",
  refundAmount: "",
  taxRate: "",
  invoiceTitle: "",
  taxNo: "",
  invoiceType: "",
  invoiceNo: "",
  invoiceDate: "",
  reimbursementDate: "",
  reimbursementRemark: "",
  remark: "",
});

export function fromOrder(order: Record<string, unknown>): OrderFormValues {
  const get = <T,>(k: string): T | null => (order[k] as T) ?? null;
  const numStr = (n: unknown) => (n === null || n === undefined ? "" : String(n));
  return {
    id: get<string>("id") ?? undefined,
    orderNo: (get<string>("orderNo") ?? "") as string,
    bookingDate: toDateInput(get<string>("bookingDate")),
    passengerName: (get<string>("passengerName") ?? "") as string,
    route: (get<string>("route") ?? "") as string,
    departureDate: toDateInput(get<string>("departureDate")),
    returnDate: toDateInput(get<string>("returnDate")),
    airline: (get<string>("airline") ?? "") as string,
    cabinClass: (get<string>("cabinClass") ?? "") as string,
    pnr: (get<string>("pnr") ?? "") as string,
    ticketNo: (get<string>("ticketNo") ?? "") as string,
    agentId: (get<string>("agentId") ?? "") as string,
    orderStatus: (get<string>("orderStatus") ?? "BOOKED") as string,
    reimbursementStatus: (get<string>("reimbursementStatus") ?? "PENDING") as string,
    actualPaidAmount: numStr(order.actualPaidAmount),
    invoiceAmount: numStr(order.invoiceAmount),
    reimbursedAmount: numStr(order.reimbursedAmount),
    agentFee: numStr(order.agentFee),
    otherCost: numStr(order.otherCost),
    refundAmount: numStr(order.refundAmount),
    taxRate: numStr(order.taxRate),
    invoiceTitle: (get<string>("invoiceTitle") ?? "") as string,
    taxNo: (get<string>("taxNo") ?? "") as string,
    invoiceType: (get<string>("invoiceType") ?? "") as string,
    invoiceNo: (get<string>("invoiceNo") ?? "") as string,
    invoiceDate: toDateInput(get<string>("invoiceDate")),
    reimbursementDate: toDateInput(get<string>("reimbursementDate")),
    reimbursementRemark: (get<string>("reimbursementRemark") ?? "") as string,
    remark: (get<string>("remark") ?? "") as string,
  };
}
