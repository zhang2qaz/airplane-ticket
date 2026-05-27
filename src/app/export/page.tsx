import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const [orderCount, agentCount] = await Promise.all([
    prisma.ticketOrder.count(),
    prisma.agent.count(),
  ]);

  return (
    <div>
      <PageHeader title="数据导出" desc="导出 CSV 文件，可直接用 Excel 打开（含 UTF-8 BOM）" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExportCard
          title="全部订单"
          desc={`导出所有 ${orderCount} 条订单的全字段（含金额、发票、报销、风险）`}
          href="/api/export/orders"
        />
        <ExportCard
          title="报销记录"
          desc="按报销日期倒序导出所有订单的报销与发票相关字段"
          href="/api/export/reimbursements"
        />
        <ExportCard
          title="代理统计"
          desc={`导出 ${agentCount} 个代理及其累计金额`}
          href="/api/export/agents"
        />
      </div>
    </div>
  );
}

function ExportCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <div className="card p-5 flex flex-col">
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)] flex-1 leading-relaxed">{desc}</p>
      <a className="btn btn-primary mt-4" href={href} download>
        ⬇ 下载 CSV
      </a>
    </div>
  );
}
