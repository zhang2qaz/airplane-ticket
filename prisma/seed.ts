// 示例数据 seed —— 可重复运行（先清空后插入）
// 运行: npx prisma db seed  或  npm run seed

import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { computeDerived } from "../src/lib/money";
import { assessRisk } from "../src/lib/risk";

import "dotenv/config";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const sqliteFile = dbUrl.startsWith("file:") ? dbUrl.slice("file:".length) : dbUrl;
const absoluteSqlite = path.isAbsolute(sqliteFile)
  ? sqliteFile
  : path.resolve(process.cwd(), sqliteFile);

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: absoluteSqlite }),
});

async function main() {
  console.log("🧹 清空旧数据…");
  await prisma.attachment.deleteMany();
  await prisma.ticketOrder.deleteMany();
  await prisma.agent.deleteMany();

  console.log("🤝 写入代理…");
  const a1 = await prisma.agent.create({
    data: {
      name: "携程商旅",
      contactPerson: "张经理",
      phone: "13800000001",
      wechat: "ctrip_zhang",
      email: "biz@ctrip.example",
      defaultAgentFee: 30,
      remark: "差旅常用",
      enabled: true,
    },
  });
  const a2 = await prisma.agent.create({
    data: {
      name: "小李代理",
      contactPerson: "李某",
      phone: "13900000002",
      wechat: "agent_li",
      defaultAgentFee: 50,
      remark: "私人代购，偶尔用",
      enabled: true,
    },
  });
  await prisma.agent.create({
    data: {
      name: "停用样例代理",
      enabled: false,
    },
  });

  console.log("✈️  写入订单…");
  const orderTemplates = [
    {
      orderNo: "TKT-20260201",
      passengerName: "张三",
      route: "PEK-HKG",
      airline: "国航",
      cabinClass: "经济舱 Y",
      pnr: "ABC123",
      ticketNo: "999-1234567890",
      bookingDate: new Date("2026-02-01"),
      departureDate: new Date("2026-02-15"),
      returnDate: new Date("2026-02-20"),
      agentId: a1.id,
      orderStatus: "COMPLETED",
      reimbursementStatus: "REIMBURSED",
      actualPaidAmount: 2800,
      invoiceAmount: 2800,
      reimbursedAmount: 2800,
      agentFee: 30,
      otherCost: 0,
      refundAmount: 0,
      taxRate: 0.06,
      invoiceTitle: "示例科技有限公司",
      taxNo: "9144000000000000XX",
      invoiceType: "ELECTRONIC",
      invoiceNo: "INV-20260205-001",
      invoiceDate: new Date("2026-02-05"),
      reimbursementDate: new Date("2026-02-25"),
      remark: "正常报销样例",
    },
    {
      orderNo: "TKT-20260301",
      passengerName: "李四",
      route: "SHA-NRT",
      airline: "全日空",
      cabinClass: "经济舱 K",
      pnr: "DEF456",
      bookingDate: new Date("2026-03-01"),
      departureDate: new Date("2026-03-20"),
      agentId: a2.id,
      orderStatus: "TICKETED",
      reimbursementStatus: "SUBMITTED",
      actualPaidAmount: 3200,
      invoiceAmount: 3400,
      reimbursedAmount: 3300,
      agentFee: 50,
      taxRate: 0.06,
      invoiceTitle: "示例科技有限公司",
      invoiceType: "GENERAL",
      invoiceNo: "INV-20260310-002",
      invoiceDate: new Date("2026-03-10"),
      remark: "发票/报销均高于真实付款的关注样例",
    },
    {
      orderNo: "TKT-20260302",
      passengerName: "王五",
      route: "CAN-BKK",
      airline: "南航",
      pnr: "GHI789",
      bookingDate: new Date("2026-03-05"),
      departureDate: new Date("2026-04-01"),
      agentId: a1.id,
      orderStatus: "BOOKED",
      reimbursementStatus: "PENDING",
      actualPaidAmount: 1800,
      invoiceAmount: 1800,
      agentFee: 30,
      taxRate: 0.06,
      remark: "待报销，缺报销金额（关注）",
    },
    {
      orderNo: "TKT-20260303",
      passengerName: "赵六",
      route: "PEK-LAX",
      airline: "海航",
      bookingDate: new Date("2026-03-08"),
      departureDate: new Date("2026-05-10"),
      agentId: a2.id,
      orderStatus: "TICKETED",
      reimbursementStatus: "SUBMITTED",
      actualPaidAmount: 6800,
      invoiceAmount: 7000,
      reimbursedAmount: 7200,
      agentFee: 50,
      taxRate: 0.06,
      invoiceTitle: "示例科技有限公司",
      invoiceType: "SPECIAL",
      remark: "报销 > 发票，异常样例（请重点核对）",
    },
    {
      orderNo: "TKT-20260304",
      passengerName: "钱七",
      route: "PEK-CDG",
      airline: "法航",
      bookingDate: new Date("2026-03-10"),
      departureDate: new Date("2026-06-01"),
      orderStatus: "CANCELED",
      reimbursementStatus: "PENDING",
      actualPaidAmount: 5500,
      refundAmount: 5000,
      taxRate: 0,
      remark: "取消订单，仅退部分款",
    },
  ];

  for (const t of orderTemplates) {
    const derived = computeDerived(t);
    const risk = assessRisk(t);
    await prisma.ticketOrder.create({
      data: {
        ...t,
        taxCost: derived.taxCost,
        reimbursementDifference: derived.reimbursementDifference,
        netBalance: derived.netBalance,
        riskLevel: risk.level,
      },
    });
  }

  await prisma.setting.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", defaultTaxRate: 0.06, currency: "CNY" },
  });

  console.log("✅ Seed 完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
