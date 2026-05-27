import { prisma } from "@/lib/prisma";
import { toCSV, csvResponse } from "@/lib/csv";
import { REIMBURSEMENT_STATUS, INVOICE_TYPE } from "@/lib/enums";
import { formatDateCN } from "@/lib/dates";

export async function GET() {
  const orders = await prisma.ticketOrder.findMany({
    orderBy: [{ reimbursementDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    include: { agent: { select: { name: true } } },
  });

  const headers = [
    "订单号", "出行人", "航线", "代理", "报销状态",
    "真实付款", "发票金额", "公司报销", "报销差额",
    "发票抬头", "税号", "发票类型", "发票号码", "开票日期",
    "报销日期", "报销备注",
  ];
  const rows = orders.map((o) => [
    o.orderNo,
    o.passengerName,
    o.route,
    o.agent?.name ?? "",
    REIMBURSEMENT_STATUS[o.reimbursementStatus] ?? o.reimbursementStatus,
    o.actualPaidAmount ?? "",
    o.invoiceAmount ?? "",
    o.reimbursedAmount ?? "",
    o.reimbursementDifference ?? "",
    o.invoiceTitle ?? "",
    o.taxNo ?? "",
    o.invoiceType ? INVOICE_TYPE[o.invoiceType] ?? o.invoiceType : "",
    o.invoiceNo ?? "",
    formatDateCN(o.invoiceDate),
    formatDateCN(o.reimbursementDate),
    o.reimbursementRemark ?? "",
  ]);

  const csv = toCSV(headers, rows);
  return csvResponse(`reimbursements-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
