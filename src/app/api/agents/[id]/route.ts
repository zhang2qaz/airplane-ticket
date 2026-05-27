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

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/agents/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();
  const name = toS(body.name);
  if (!name) return Response.json({ error: "代理名称必填" }, { status: 400 });

  try {
    const a = await prisma.agent.update({
      where: { id },
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
    return Response.json(a);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "更新失败";
    if (/Unique constraint/i.test(msg) || /UNIQUE/i.test(msg)) {
      return Response.json({ error: "代理名称已存在" }, { status: 409 });
    }
    if (/not found/i.test(msg)) {
      return Response.json({ error: "未找到该代理" }, { status: 404 });
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/agents/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.agent.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "删除失败" }, { status: 500 });
  }
}
