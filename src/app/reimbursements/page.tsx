import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Money } from "@/components/Money";
import { ReimbursementStatusChip, RiskChip } from "@/components/Chips";
import { formatDateCN } from "@/lib/dates";
import { REIMBURSEMENT_STATUS } from "@/lib/enums";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "", label: "全部" },
  { key: "PENDING", label: "未报销" },
  { key: "SUBMITTED", label: "已提交" },
  { key: "REIMBURSED", label: "已报销" },
  { key: "REJECTED", label: "被退回" },
];

export default async function ReimbursementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const status = sp.status?.trim();

  const where: Record<string, unknown> = {};
  if (status && STATUS_FILTERS.find((f) => f.key === status)) {
    where.reimbursementStatus = status;
  }

  const orders = await prisma.ticketOrder.findMany({
    where,
    orderBy: [{ reimbursementDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    include: { agent: { select: { name: true } } },
  });

  // 统计
  const counts = await prisma.ticketOrder.groupBy({
    by: ["reimbursementStatus"],
    _count: true,
  });
  const countMap = new Map(counts.map((c) => [c.reimbursementStatus, c._count]));

  return (
    <div>
      <PageHeader title="报销记录" desc={`共 ${orders.length} 条记录`} />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {["PENDING", "SUBMITTED", "REIMBURSED", "REJECTED"].map((k) => (
          <div key={k} className="card p-4">
            <div className="text-[12px] text-[var(--muted)]">{REIMBURSEMENT_STATUS[k]}</div>
            <div className="text-2xl font-semibold mt-1">{countMap.get(k) ?? 0}</div>
          </div>
        ))}
      </div>

      {/* 状态筛选 tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const active = (status ?? "") === f.key;
          const href = f.key ? `/reimbursements?status=${f.key}` : "/reimbursements";
          return (
            <Link
              key={f.key || "all"}
              href={href}
              className={
                "px-3 py-1.5 rounded-md text-sm border " +
                (active
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-white text-zinc-700 border-[var(--border)] hover:bg-zinc-50")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="card overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>订单号</th>
              <th>出行人</th>
              <th>航线</th>
              <th>代理</th>
              <th className="num">真实付款</th>
              <th className="num">发票金额</th>
              <th className="num">已报销</th>
              <th className="num">报销差额</th>
              <th>发票日期</th>
              <th>报销日期</th>
              <th>状态</th>
              <th>风险</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center text-[var(--muted)] py-8">
                  暂无记录
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/orders/${o.id}`} className="text-[var(--accent)] hover:underline">
                      {o.orderNo}
                    </Link>
                  </td>
                  <td>{o.passengerName}</td>
                  <td>{o.route}</td>
                  <td>{o.agent?.name ?? "—"}</td>
                  <td className="num"><Money value={o.actualPaidAmount} /></td>
                  <td className="num"><Money value={o.invoiceAmount} /></td>
                  <td className="num"><Money value={o.reimbursedAmount} /></td>
                  <td className="num"><Money value={o.reimbursementDifference} asBalance /></td>
                  <td>{formatDateCN(o.invoiceDate)}</td>
                  <td>{formatDateCN(o.reimbursementDate)}</td>
                  <td><ReimbursementStatusChip status={o.reimbursementStatus} /></td>
                  <td><RiskChip level={o.riskLevel} /></td>
                  <td>
                    <Link href={`/orders/${o.id}/edit`} className="text-[var(--accent)] text-sm hover:underline">
                      编辑
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
