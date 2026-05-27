import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { AgentsManager } from "./AgentsManager";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    orderBy: [{ enabled: "desc" }, { name: "asc" }],
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNo: true,
          passengerName: true,
          route: true,
          actualPaidAmount: true,
          createdAt: true,
        },
      },
      _count: { select: { orders: true } },
    },
  });

  // 计算每个代理的累计金额
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

  const enriched = agents.map((a) => ({
    ...a,
    actualPaidSum: totalMap.get(a.id)?.actualPaidSum ?? 0,
    agentFeeSum: totalMap.get(a.id)?.agentFeeSum ?? 0,
  }));

  return (
    <div>
      <PageHeader title="代理管理" desc={`共 ${agents.length} 个代理`} />
      <AgentsManager initialAgents={enriched} />
    </div>
  );
}
