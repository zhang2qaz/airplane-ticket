import { prisma } from "@/lib/prisma";
import { toCSV, csvResponse } from "@/lib/csv";

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true } } },
  });

  const totals = await prisma.ticketOrder.groupBy({
    by: ["agentId"],
    _sum: { actualPaidAmount: true, agentFee: true },
  });
  const totalMap = new Map(
    totals.map((t) => [
      t.agentId ?? "",
      {
        actualPaidSum: t._sum.actualPaidAmount ?? 0,
        agentFeeSum: t._sum.agentFee ?? 0,
      },
    ]),
  );

  const headers = [
    "代理名称", "联系人", "电话", "微信", "邮箱",
    "默认服务费", "订单数", "累计真实付款", "累计代理服务费",
    "状态", "备注",
  ];
  const rows = agents.map((a) => [
    a.name,
    a.contactPerson ?? "",
    a.phone ?? "",
    a.wechat ?? "",
    a.email ?? "",
    a.defaultAgentFee ?? "",
    a._count.orders,
    totalMap.get(a.id)?.actualPaidSum ?? 0,
    totalMap.get(a.id)?.agentFeeSum ?? 0,
    a.enabled ? "启用" : "停用",
    a.remark ?? "",
  ]);

  const csv = toCSV(headers, rows);
  return csvResponse(`agents-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
