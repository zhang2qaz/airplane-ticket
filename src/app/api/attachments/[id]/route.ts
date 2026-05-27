import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/attachments/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.attachment.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "删除失败" }, { status: 500 });
  }
}
