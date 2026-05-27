import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Money } from "@/components/Money";
import { OrderStatusChip, ReimbursementStatusChip, RiskChip } from "@/components/Chips";
import { formatDateCN } from "@/lib/dates";
import { computeDerived } from "@/lib/money";
import { assessRisk } from "@/lib/risk";
import { INVOICE_TYPE } from "@/lib/enums";
import { DeleteOrderButton } from "./DeleteOrderButton";
import { AttachmentSection } from "./AttachmentSection";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.ticketOrder.findUnique({
    where: { id },
    include: { agent: true, attachments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const derived = computeDerived(order);
  const risk = assessRisk(order);

  const invoiceHigherThanPaid =
    order.invoiceAmount != null &&
    order.actualPaidAmount != null &&
    order.invoiceAmount > order.actualPaidAmount;
  const reimbursedHigherThanPaid =
    order.reimbursedAmount != null &&
    order.actualPaidAmount != null &&
    order.reimbursedAmount > order.actualPaidAmount;
  const reimbursedHigherThanInvoice =
    order.reimbursedAmount != null &&
    order.invoiceAmount != null &&
    order.reimbursedAmount > order.invoiceAmount;

  return (
    <div>
      <PageHeader
        title={`订单 ${order.orderNo}`}
        desc={`${order.passengerName} · ${order.route}`}
        actions={
          <div className="flex gap-2">
            <Link href="/orders" className="btn btn-secondary">← 返回</Link>
            <Link href={`/orders/${order.id}/edit`} className="btn btn-primary">编辑</Link>
            <DeleteOrderButton id={order.id} />
          </div>
        }
      />

      {/* 摘要卡片 */}
      <div className="card p-5 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
          <Sum label="真实付款" v={order.actualPaidAmount} />
          <Sum label="发票金额" v={order.invoiceAmount} />
          <Sum label="已报销" v={order.reimbursedAmount} />
          <SumBalance label="报销差额" v={derived.reimbursementDifference} />
          <Sum label="税点成本" v={derived.taxCost} />
          <SumBalance label="实际结余" v={derived.netBalance} />
          <div>
            <div className="text-[12px] text-[var(--muted)] mb-1">风险等级</div>
            <RiskChip level={risk.level} />
            {risk.reasons.length > 0 && (
              <div className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                {risk.reasons.join(" · ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 风险提示 */}
      <div className="space-y-2 mb-5">
        {invoiceHigherThanPaid && (
          <div className="alert-warn">⚠ 发票金额高于真实付款金额，存在异常差额，请自行确认合规性。</div>
        )}
        {reimbursedHigherThanPaid && (
          <div className="alert-warn">⚠ 报销金额高于真实付款金额，存在报销差额，请保留完整说明与凭证。</div>
        )}
        {reimbursedHigherThanInvoice && (
          <div className="alert-anomaly">⛔ 报销金额高于发票金额，存在显著异常差额，请重点核对。</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InfoBlock title="基本信息">
          <KV k="订单号">{order.orderNo}</KV>
          <KV k="出行人">{order.passengerName}</KV>
          <KV k="航线">{order.route}</KV>
          <KV k="航司">{order.airline ?? "—"}</KV>
          <KV k="舱位">{order.cabinClass ?? "—"}</KV>
          <KV k="PNR">{order.pnr ?? "—"}</KV>
          <KV k="票号">{order.ticketNo ?? "—"}</KV>
          <KV k="预订日期">{formatDateCN(order.bookingDate)}</KV>
          <KV k="出发日期">{formatDateCN(order.departureDate)}</KV>
          <KV k="返程日期">{formatDateCN(order.returnDate)}</KV>
          <KV k="订单状态"><OrderStatusChip status={order.orderStatus} /></KV>
        </InfoBlock>

        <InfoBlock title="金额信息">
          <KVMoney k="真实付款金额" v={order.actualPaidAmount} />
          <KVMoney k="代理服务费" v={order.agentFee} />
          <KVMoney k="其他成本" v={order.otherCost} />
          <KVMoney k="退款金额" v={order.refundAmount} />
          <KV k="税点">{order.taxRate ?? "—"}</KV>
          <KVMoney k="税点成本" v={derived.taxCost} />
          <KVMoney k="真实总成本" v={derived.totalActualCost} />
          <KVBalance k="报销差额" v={derived.reimbursementDifference} />
          <KVBalance k="实际资金结余" v={derived.netBalance} />
        </InfoBlock>

        <InfoBlock title="发票信息">
          <KV k="发票抬头">{order.invoiceTitle ?? "—"}</KV>
          <KV k="税号">{order.taxNo ?? "—"}</KV>
          <KV k="发票类型">{order.invoiceType ? INVOICE_TYPE[order.invoiceType] ?? order.invoiceType : "—"}</KV>
          <KV k="发票号码">{order.invoiceNo ?? "—"}</KV>
          <KVMoney k="发票金额" v={order.invoiceAmount} />
          <KV k="开票日期">{formatDateCN(order.invoiceDate)}</KV>
        </InfoBlock>

        <InfoBlock title="报销信息">
          <KV k="报销状态"><ReimbursementStatusChip status={order.reimbursementStatus} /></KV>
          <KVMoney k="公司报销金额" v={order.reimbursedAmount} />
          <KV k="报销日期">{formatDateCN(order.reimbursementDate)}</KV>
          <KV k="报销备注" full>{order.reimbursementRemark ?? "—"}</KV>
        </InfoBlock>

        <InfoBlock title="代理信息">
          {order.agent ? (
            <>
              <KV k="代理名称">
                <Link href="/agents" className="text-[var(--accent)] hover:underline">
                  {order.agent.name}
                </Link>
              </KV>
              <KV k="联系人">{order.agent.contactPerson ?? "—"}</KV>
              <KV k="电话">{order.agent.phone ?? "—"}</KV>
              <KV k="微信">{order.agent.wechat ?? "—"}</KV>
              <KV k="邮箱">{order.agent.email ?? "—"}</KV>
            </>
          ) : (
            <div className="text-[var(--muted)] text-sm">未关联代理</div>
          )}
        </InfoBlock>

        <InfoBlock title="备注">
          <div className="text-sm text-zinc-700 whitespace-pre-wrap">{order.remark ?? "—"}</div>
        </InfoBlock>
      </div>

      {/* 附件 */}
      <div className="mt-5">
        <AttachmentSection orderId={order.id} attachments={order.attachments} />
      </div>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold mb-3 text-zinc-700">{title}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">{children}</div>
    </div>
  );
}

function KV({
  k,
  children,
  full,
}: {
  k: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="text-[12px] text-[var(--muted)] mb-0.5">{k}</div>
      <div>{children}</div>
    </div>
  );
}

function KVMoney({ k, v }: { k: string; v: number | null | undefined }) {
  return (
    <div>
      <div className="text-[12px] text-[var(--muted)] mb-0.5">{k}</div>
      <Money value={v} />
    </div>
  );
}

function KVBalance({ k, v }: { k: string; v: number }) {
  return (
    <div>
      <div className="text-[12px] text-[var(--muted)] mb-0.5">{k}</div>
      <Money value={v} asBalance />
    </div>
  );
}

function Sum({ label, v }: { label: string; v: number | null | undefined }) {
  return (
    <div>
      <div className="text-[12px] text-[var(--muted)] mb-1">{label}</div>
      <Money value={v} className="text-base" />
    </div>
  );
}

function SumBalance({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-[12px] text-[var(--muted)] mb-1">{label}</div>
      <Money value={v} asBalance className="text-base" />
    </div>
  );
}
