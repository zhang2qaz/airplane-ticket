import { prisma } from "@/lib/prisma";
import { buildOrderData, validateOrder } from "@/lib/orderUtils";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const status = req.nextUrl.searchParams.get("status")?.trim();
  const reimb = req.nextUrl.searchParams.get("reimbursement")?.trim();

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { orderNo: { contains: q } },
      { passengerName: { contains: q } },
      { route: { contains: q } },
      { pnr: { contains: q } },
      { ticketNo: { contains: q } },
      { airline: { contains: q } },
    ];
  }
  if (status) where.orderStatus = status;
  if (reimb) where.reimbursementStatus = reimb;

  const orders = await prisma.ticketOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { agent: { select: { id: true, name: true } } },
  });
  return Response.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = buildOrderData(body);
  const err = validateOrder(data);
  if (err) return Response.json({ error: err }, { status: 400 });

  try {
    const created = await prisma.ticketOrder.create({ data });
    return Response.json(created, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "创建失败";
    if (/Unique constraint/i.test(msg) || /UNIQUE/i.test(msg)) {
      return Response.json({ error: "订单号已存在" }, { status: 409 });
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}
