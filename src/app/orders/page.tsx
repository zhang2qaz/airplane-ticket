import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { ReimbursementStatusChip, RiskChip } from "@/components/Chips";
import { Money } from "@/components/Money";
import { formatDateCN } from "@/lib/dates";
import { OrdersSearch } from "./OrdersSearch";

export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; reimbursement?: string };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};
  const q = sp.q?.trim();
  const status = sp.status?.trim();
  const reimb = sp.reimbursement?.trim();

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { orderNo: { contains: q } },
      { passengerName: { contains: q } },
      { route: { contains: q } },
      { pnr: { contains: q } },
      { ticketNo: { contains: q } },
      { airline: { contains: q } },
      { agent: { is: { name: { contains: q } } } },
    ];
  }
  if (status) where.orderStatus = status;
  if (reimb) where.reimbursementStatus = reimb;

  const orders = await prisma.ticketOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { agent: { select: { id: true, name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="机票订单"
        desc={`共 ${orders.length} 条记录`}
        actions={
          <Link href="/orders/new" className="btn btn-primary">
            + 新增订单
          </Link>
        }
      />

      <OrdersSearch defaultQ={q ?? ""} defaultStatus={status ?? ""} defaultReimb={reimb ?? ""} />

      <div className="card overflow-x-auto mt-4">
        <table className="tbl">
          <thead>
            <tr>
              <th>订单号</th>
              <th>出行人</th>
              <th>航线</th>
              <th>出发日期</th>
              <th>代理</th>
              <th className="num">真实付款</th>
              <th className="num">发票金额</th>
              <th className="num">已报销</th>
              <th className="num">报销差额</th>
              <th className="num">实际结余</th>
              <th>报销状态</th>
              <th>风险</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center text-[var(--muted)] py-8">
                  暂无订单。<Link href="/orders/new" className="text-[var(--accent)]">新增第一条 →</Link>
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link
                      href={`/orders/${o.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {o.orderNo}
                    </Link>
                  </td>
                  <td>{o.passengerName}</td>
                  <td>{o.route}</td>
                  <td>{formatDateCN(o.departureDate)}</td>
                  <td>{o.agent?.name ?? "—"}</td>
                  <td className="num">
                    <Money value={o.actualPaidAmount} />
                  </td>
                  <td className="num">
                    <Money value={o.invoiceAmount} />
                  </td>
                  <td className="num">
                    <Money value={o.reimbursedAmount} />
                  </td>
                  <td className="num">
                    <Money value={o.reimbursementDifference} asBalance />
                  </td>
                  <td className="num">
                    <Money value={o.netBalance} asBalance />
                  </td>
                  <td>
                    <ReimbursementStatusChip status={o.reimbursementStatus} />
                  </td>
                  <td>
                    <RiskChip level={o.riskLevel} />
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/orders/${o.id}`}
                        className="text-[var(--accent)] text-sm hover:underline"
                      >
                        详情
                      </Link>
                      <Link
                        href={`/orders/${o.id}/edit`}
                        className="text-zinc-600 text-sm hover:underline"
                      >
                        编辑
                      </Link>
                    </div>
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
