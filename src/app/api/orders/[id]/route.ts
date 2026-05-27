import { prisma } from "@/lib/prisma";
import { buildOrderData, validateOrder } from "@/lib/orderUtils";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const order = await prisma.ticketOrder.findUnique({
    where: { id },
    include: { agent: true, attachments: true },
  });
  if (!order) return Response.json({ error: "未找到" }, { status: 404 });
  return Response.json(order);
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();
  const data = buildOrderData(body);
  const err = validateOrder(data);
  if (err) return Response.json({ error: err }, { status: 400 });

  try {
    const updated = await prisma.ticketOrder.update({ where: { id }, data });
    return Response.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "更新失败";
    if (/Unique constraint/i.test(msg) || /UNIQUE/i.test(msg)) {
      return Response.json({ error: "订单号已存在" }, { status: 409 });
    }
    if (/Record to update not found/i.test(msg)) {
      return Response.json({ error: "未找到该订单" }, { status: 404 });
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.ticketOrder.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "删除失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
