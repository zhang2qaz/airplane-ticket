// 中文枚举映射

export const ORDER_STATUS: Record<string, string> = {
  BOOKED: "已预订",
  TICKETED: "已出票",
  CANCELED: "已取消",
  REFUNDED: "已退票",
  COMPLETED: "已完成",
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS).map(([value, label]) => ({
  value,
  label,
}));

export const REIMBURSEMENT_STATUS: Record<string, string> = {
  PENDING: "未报销",
  SUBMITTED: "已提交",
  REIMBURSED: "已报销",
  REJECTED: "被退回",
};

export const REIMBURSEMENT_STATUS_OPTIONS = Object.entries(REIMBURSEMENT_STATUS).map(([value, label]) => ({
  value,
  label,
}));

export const INVOICE_TYPE: Record<string, string> = {
  GENERAL: "普票",
  SPECIAL: "专票",
  ELECTRONIC: "电子发票",
  ITINERARY: "行程单",
  OTHER: "其他",
};

export const INVOICE_TYPE_OPTIONS = Object.entries(INVOICE_TYPE).map(([value, label]) => ({
  value,
  label,
}));

export const ATTACHMENT_TYPE: Record<string, string> = {
  ETICKET: "电子客票",
  ITINERARY: "行程单",
  INVOICE: "发票",
  PAYMENT: "付款凭证",
  REIMBURSEMENT: "报销凭证",
  AGENT_QUOTE: "代理报价",
  OTHER: "其他",
};

export const ATTACHMENT_TYPE_OPTIONS = Object.entries(ATTACHMENT_TYPE).map(([value, label]) => ({
  value,
  label,
}));

export const ORDER_STATUS_CLASS: Record<string, string> = {
  BOOKED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  TICKETED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  CANCELED: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
  REFUNDED: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
  COMPLETED: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
};

export const REIMBURSEMENT_STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
  SUBMITTED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  REIMBURSED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};
