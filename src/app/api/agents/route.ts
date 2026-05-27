import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

const toS = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const toN = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v));
  return Number.isNaN(n) ? null : n;
};

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: [{ enabled: "desc" }, { name: "asc" }],
    include: { _count: { select: { orders: true } } },
  });
  return Response.json(agents);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = toS(body.name);
  if (!name) return Response.json({ error: "代理名称必填" }, { status: 400 });

  try {
    const a = await prisma.agent.create({
      data: {
        name,
        contactPerson: toS(body.contactPerson),
        phone: toS(body.phone),
        wechat: toS(body.wechat),
        email: toS(body.email),
        defaultAgentFee: toN(body.defaultAgentFee),
        remark: toS(body.remark),
        enabled: body.enabled !== false,
      },
    });
    return Response.json(a, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "创建失败";
    if (/Unique constraint/i.test(msg) || /UNIQUE/i.test(msg)) {
      return Response.json({ error: "代理名称已存在" }, { status: 409 });
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}
