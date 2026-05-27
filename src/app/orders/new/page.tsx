import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { OrderForm } from "@/components/OrderForm";
import { emptyForm } from "@/lib/orderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const agents = await prisma.agent.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, defaultAgentFee: true },
  });

  const initial = {
    ...emptyForm(),
    taxRate: "0.06",
  };

  return (
    <div>
      <PageHeader title="新增订单" desc="填写订单信息，金额会实时计算" />
      <OrderForm initial={initial} agents={agents} mode="create" />
    </div>
  );
}
