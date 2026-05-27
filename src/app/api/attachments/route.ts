import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

const ALLOWED_TYPES = [
  "ETICKET",
  "ITINERARY",
  "INVOICE",
  "PAYMENT",
  "REIMBURSEMENT",
  "AGENT_QUOTE",
  "OTHER",
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderId = String(body.orderId ?? "").trim();
  const name = String(body.name ?? "").trim();
  const url = String(body.url ?? "").trim();
  const type = ALLOWED_TYPES.includes(String(body.type)) ? String(body.type) : "OTHER";
  const remark = body.remark ? String(body.remark) : null;

  if (!orderId) return Response.json({ error: "orderId 必填" }, { status: 400 });
  if (!name) return Response.json({ error: "附件名称必填" }, { status: 400 });
  if (!url) return Response.json({ error: "附件链接/路径必填" }, { status: 400 });

  try {
    const att = await prisma.attachment.create({
      data: { orderId, name, url, type, remark },
    });
    return Response.json(att, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "创建失败" }, { status: 500 });
  }
}
