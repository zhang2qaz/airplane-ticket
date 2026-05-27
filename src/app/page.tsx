import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Money } from "@/components/Money";
import { OrderStatusChip, ReimbursementStatusChip, RiskChip } from "@/components/Chips";
import { formatDateCN } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalCount, sums, pendingCount, abnormalCount, watchCount, recent] = await Promise.all([
    prisma.ticketOrder.count(),
    prisma.ticketOrder.aggregate({
      _sum: {
        actualPaidAmount: true,
        invoiceAmount: true,
        reimbursedAmount: true,
        reimbursementDifference: true,
        netBalance: true,
      },
    }),
    prisma.ticketOrder.count({
      where: { reimbursementStatus: { in: ["PENDING", "SUBMITTED", "REJECTED"] } },
    }),
    prisma.ticketOrder.count({ where: { riskLevel: "ABNORMAL" } }),
    prisma.ticketOrder.count({ where: { riskLevel: "WATCH" } }),
    prisma.ticketOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { agent: { select: { name: true } } },
    }),
  ]);

  const totalActualPaid = sums._sum.actualPaidAmount ?? 0;
  const totalInvoice = sums._sum.invoiceAmount ?? 0;
  const totalReimbursed = sums._sum.reimbursedAmount ?? 0;
  const totalReimbDiff = totalReimbursed - totalActualPaid;

  return (
    <div>
      <PageHeader
        title="仪表盘"
        desc="个人机票、发票、报销和资金结余总览"
        actions={
          <Link href="/orders/new" className="btn btn-primary">+ 新增订单</Link>
        }
      />

      {/* KPI 卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <KPI label="总订单数" valueText={String(totalCount)} />
        <KPI label="总真实付款" money={totalActualPaid} />
        <KPI label="总发票金额" money={totalInvoice} />
        <KPI label="总已报销金额" money={totalReimbursed} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="card p-4">
          <div className="text-[12px] text-[var(--muted)] mb-1">总报销差额</div>
          <Money value={totalReimbDiff} asBalance className="text-2xl font-semibold" />
          <div className="text-[11px] text-[var(--muted)] mt-1">
            {totalReimbDiff > 0
              ? "结余（报销 > 真实付款）"
              : totalReimbDiff < 0
              ? "未覆盖成本（报销 < 真实付款）"
              : "持平"}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-[var(--muted)] mb-1">未报销订单数</div>
          <div className="text-2xl font-semibold">{pendingCount}</div>
          <div className="text-[11px] text-[var(--muted)] mt-1">包含 未报销/已提交/被退回</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-[var(--muted)] mb-1">异常差额订单</div>
          <div className="text-2xl font-semibold text-rose-600">{abnormalCount}</div>
          <div className="text-[11px] text-[var(--muted)] mt-1">
            <Link href="/orders" className="text-[var(--accent)] hover:underline">→ 查看订单</Link>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-[var(--muted)] mb-1">关注订单</div>
          <div className="text-2xl font-semibold text-amber-600">{watchCount}</div>
          <div className="text-[11px] text-[var(--muted)] mt-1">需要进一步核对的订单</div>
        </div>
      </div>

      {/* 最近 10 条订单 */}
      <div className="card">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700">最近 10 条订单</h3>
          <Link href="/orders" className="text-sm text-[var(--accent)] hover:underline">查看全部 →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>订单号</th>
                <th>出行人</th>
                <th>航线</th>
                <th>出发日期</th>
                <th>代理</th>
                <th className="num">真实付款</th>
                <th className="num">已报销</th>
                <th className="num">结余</th>
                <th>订单状态</th>
                <th>报销状态</th>
                <th>风险</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center text-[var(--muted)] py-8">
                    暂无订单。<Link href="/orders/new" className="text-[var(--accent)]">新增第一条 →</Link>
                  </td>
                </tr>
              ) : (
                recent.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/orders/${o.id}`} className="text-[var(--accent)] hover:underline">
                        {o.orderNo}
                      </Link>
                    </td>
                    <td>{o.passengerName}</td>
                    <td>{o.route}</td>
                    <td>{formatDateCN(o.departureDate)}</td>
                    <td>{o.agent?.name ?? "—"}</td>
                    <td className="num"><Money value={o.actualPaidAmount} /></td>
                    <td className="num"><Money value={o.reimbursedAmount} /></td>
                    <td className="num"><Money value={o.netBalance} asBalance /></td>
                    <td><OrderStatusChip status={o.orderStatus} /></td>
                    <td><ReimbursementStatusChip status={o.reimbursementStatus} /></td>
                    <td><RiskChip level={o.riskLevel} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, money, valueText }: { label: string; money?: number; valueText?: string }) {
  return (
    <div className="card p-4">
      <div className="text-[12px] text-[var(--muted)] mb-1">{label}</div>
      {valueText !== undefined ? (
        <div className="text-2xl font-semibold">{valueText}</div>
      ) : (
        <Money value={money ?? 0} className="text-2xl font-semibold" />
      )}
    </div>
  );
}
