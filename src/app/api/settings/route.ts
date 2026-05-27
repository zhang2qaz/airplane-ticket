import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET() {
  const s =
    (await prisma.setting.findUnique({ where: { id: "global" } })) ??
    (await prisma.setting.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global", defaultTaxRate: 0.06, currency: "CNY" },
    }));
  return Response.json(s);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const defaultTaxRate =
    body.defaultTaxRate === "" || body.defaultTaxRate === null || body.defaultTaxRate === undefined
      ? null
      : parseFloat(String(body.defaultTaxRate));
  const currency = body.currency ? String(body.currency).trim() : "CNY";

  const s = await prisma.setting.upsert({
    where: { id: "global" },
    update: {
      defaultTaxRate: Number.isNaN(defaultTaxRate as number) ? null : defaultTaxRate,
      currency,
    },
    create: {
      id: "global",
      defaultTaxRate: Number.isNaN(defaultTaxRate as number) ? 0.06 : (defaultTaxRate ?? 0.06),
      currency,
    },
  });
  return Response.json(s);
}
