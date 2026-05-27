import { prisma } from "@/lib/prisma";
import { toCSV, csvResponse } from "@/lib/csv";
import { ORDER_STATUS, REIMBURSEMENT_STATUS, INVOICE_TYPE } from "@/lib/enums";
import { RISK_LABEL } from "@/lib/risk";
import { formatDateCN } from "@/lib/dates";

export async function GET() {
  const orders = await prisma.ticketOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { agent: { select: { name: true } } },
  });

  const headers = [
    "订单号", "预订日期", "出行人", "航线", "出发日期", "返程日期",
    "航司", "舱位", "PNR", "票号", "代理", "订单状态", "报销状态",
    "真实付款金额", "发票金额", "公司报销金额", "代理服务费",
    "其他成本", "退款金额", "税点", "税点成本",
    "报销差额", "实际资金结余",
    "发票抬头", "税号", "发票类型", "发票号码", "开票日期",
    "报销日期", "报销备注",
    "风险等级", "备注", "创建时间",
  ];

  const rows = orders.map((o) => [
    o.orderNo,
    formatDateCN(o.bookingDate),
    o.passengerName,
    o.route,
    formatDateCN(o.departureDate),
    formatDateCN(o.returnDate),
    o.airline ?? "",
    o.cabinClass ?? "",
    o.pnr ?? "",
    o.ticketNo ?? "",
    o.agent?.name ?? "",
    ORDER_STATUS[o.orderStatus] ?? o.orderStatus,
    REIMBURSEMENT_STATUS[o.reimbursementStatus] ?? o.reimbursementStatus,
    o.actualPaidAmount ?? "",
    o.invoiceAmount ?? "",
    o.reimbursedAmount ?? "",
    o.agentFee ?? "",
    o.otherCost ?? "",
    o.refundAmount ?? "",
    o.taxRate ?? "",
    o.taxCost ?? "",
    o.reimbursementDifference ?? "",
    o.netBalance ?? "",
    o.invoiceTitle ?? "",
    o.taxNo ?? "",
    o.invoiceType ? INVOICE_TYPE[o.invoiceType] ?? o.invoiceType : "",
    o.invoiceNo ?? "",
    formatDateCN(o.invoiceDate),
    formatDateCN(o.reimbursementDate),
    o.reimbursementRemark ?? "",
    RISK_LABEL[o.riskLevel as keyof typeof RISK_LABEL] ?? o.riskLevel,
    o.remark ?? "",
    o.createdAt.toISOString().slice(0, 19).replace("T", " "),
  ]);

  const csv = toCSV(headers, rows);
  return csvResponse(`orders-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
