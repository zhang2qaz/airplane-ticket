import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { OrderForm } from "@/components/OrderForm";
import { fromOrder } from "@/lib/orderForm";

export const dynamic = "force-dynamic";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, agents] = await Promise.all([
    prisma.ticketOrder.findUnique({ where: { id } }),
    prisma.agent.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, defaultAgentFee: true },
    }),
  ]);
  if (!order) notFound();

  return (
    <div>
      <PageHeader title="编辑订单" desc={order.orderNo} />
      <OrderForm initial={fromOrder(order as unknown as Record<string, unknown>)} agents={agents} mode="edit" />
    </div>
  );
}
