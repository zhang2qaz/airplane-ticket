"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Money } from "@/components/Money";
import { RiskChip } from "@/components/Chips";
import { computeDerived } from "@/lib/money";
import { assessRisk, RISK_LABEL } from "@/lib/risk";
import {
  ORDER_STATUS_OPTIONS,
  REIMBURSEMENT_STATUS_OPTIONS,
  INVOICE_TYPE_OPTIONS,
} from "@/lib/enums";
import type { OrderFormValues } from "@/lib/orderForm";

export type AgentOption = { id: string; name: string; defaultAgentFee?: number | null };

const toNum = (s: string): number | null => {
  if (s === "" || s === null || s === undefined) return null;
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
};

export function OrderForm({
  initial,
  agents,
  mode,
}: {
  initial: OrderFormValues;
  agents: AgentOption[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<OrderFormValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof OrderFormValues>(k: K, v: OrderFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onAgentChange = (id: string) => {
    update("agentId", id);
    if (!form.agentFee || form.agentFee === "0") {
      const a = agents.find((x) => x.id === id);
      if (a?.defaultAgentFee != null) update("agentFee", String(a.defaultAgentFee));
    }
  };

  const numericInput = useMemo(
    () => ({
      actualPaidAmount: toNum(form.actualPaidAmount),
      invoiceAmount: toNum(form.invoiceAmount),
      reimbursedAmount: toNum(form.reimbursedAmount),
      agentFee: toNum(form.agentFee),
      otherCost: toNum(form.otherCost),
      refundAmount: toNum(form.refundAmount),
      taxRate: toNum(form.taxRate),
    }),
    [
      form.actualPaidAmount,
      form.invoiceAmount,
      form.reimbursedAmount,
      form.agentFee,
      form.otherCost,
      form.refundAmount,
      form.taxRate,
    ],
  );

  const derived = useMemo(() => computeDerived(numericInput), [numericInput]);
  const risk = useMemo(() => assessRisk(numericInput), [numericInput]);

  const invoiceHigherThanPaid =
    numericInput.invoiceAmount != null &&
    numericInput.actualPaidAmount != null &&
    numericInput.invoiceAmount > numericInput.actualPaidAmount;

  const reimbursedHigherThanPaid =
    numericInput.reimbursedAmount != null &&
    numericInput.actualPaidAmount != null &&
    numericInput.reimbursedAmount > numericInput.actualPaidAmount;

  const reimbursedHigherThanInvoice =
    numericInput.reimbursedAmount != null &&
    numericInput.invoiceAmount != null &&
    numericInput.reimbursedAmount > numericInput.invoiceAmount;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      ...form,
      // Prisma/路由会自动把空串当 null
    };

    try {
      const url = mode === "create" ? "/api/orders" : `/api/orders/${initial.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `保存失败 (${res.status})`);
        setSubmitting(false);
        return;
      }
      const saved = await res.json();
      router.push(`/orders/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* 摘要 + 风险 */}
      <div className="card p-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
        <Summary label="真实付款" value={numericInput.actualPaidAmount} />
        <Summary label="发票金额" value={numericInput.invoiceAmount} />
        <Summary label="已报销" value={numericInput.reimbursedAmount} />
        <Summary label="税点成本" value={derived.taxCost} />
        <SummaryBalance label="报销差额" value={derived.reimbursementDifference} />
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

      {/* 实际结余单列 */}
      <div className="card p-4 flex items-center justify-between text-sm">
        <div className="text-[var(--muted)]">实际资金结余（= 已报销 − 真实成本）</div>
        <Money value={derived.netBalance} asBalance className="text-base" />
      </div>

      {/* 异常提示 */}
      {invoiceHigherThanPaid && (
        <div className="alert-warn">
          ⚠ 发票金额高于真实付款金额，存在异常差额，请自行确认合规性。
        </div>
      )}
      {reimbursedHigherThanPaid && (
        <div className="alert-warn">
          ⚠ 报销金额高于真实付款金额，存在报销差额，请保留完整说明与凭证。
        </div>
      )}
      {reimbursedHigherThanInvoice && (
        <div className="alert-anomaly">
          ⛔ 报销金额高于发票金额，风险等级为「{RISK_LABEL.ABNORMAL}」，请重点核对。
        </div>
      )}

      <Section title="基本信息">
        <Field label="订单号 *" required>
          <input
            className="input"
            placeholder="例：TKT-20260201 或航司订单号"
            value={form.orderNo}
            onChange={(e) => update("orderNo", e.target.value)}
          />
        </Field>
        <Field label="预订日期">
          <input
            type="date"
            className="input"
            value={form.bookingDate}
            onChange={(e) => update("bookingDate", e.target.value)}
          />
        </Field>
        <Field label="出行人 *" required>
          <input className="input" value={form.passengerName} onChange={(e) => update("passengerName", e.target.value)} />
        </Field>
        <Field label="订单状态">
          <select className="select" value={form.orderStatus} onChange={(e) => update("orderStatus", e.target.value)}>
            {ORDER_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="航班信息">
        <Field label="航线 *" required>
          <input
            className="input"
            placeholder="例：PEK-HKG"
            value={form.route}
            onChange={(e) => update("route", e.target.value)}
          />
        </Field>
        <Field label="航司">
          <input className="input" value={form.airline} onChange={(e) => update("airline", e.target.value)} />
        </Field>
        <Field label="舱位">
          <input className="input" placeholder="例：经济舱 Y" value={form.cabinClass} onChange={(e) => update("cabinClass", e.target.value)} />
        </Field>
        <Field label="PNR">
          <input className="input" value={form.pnr} onChange={(e) => update("pnr", e.target.value)} />
        </Field>
        <Field label="票号">
          <input className="input" value={form.ticketNo} onChange={(e) => update("ticketNo", e.target.value)} />
        </Field>
        <Field label="出发日期">
          <input type="date" className="input" value={form.departureDate} onChange={(e) => update("departureDate", e.target.value)} />
        </Field>
        <Field label="返程日期">
          <input type="date" className="input" value={form.returnDate} onChange={(e) => update("returnDate", e.target.value)} />
        </Field>
      </Section>

      <Section title="代理信息">
        <Field label="代理">
          <select className="select" value={form.agentId} onChange={(e) => onAgentChange(e.target.value)}>
            <option value="">（无）</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </Field>
        <Field label="代理服务费">
          <input
            type="number"
            step="0.01"
            className="input num"
            value={form.agentFee}
            onChange={(e) => update("agentFee", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="金额信息">
        <Field label="真实付款金额">
          <input type="number" step="0.01" className="input num" value={form.actualPaidAmount} onChange={(e) => update("actualPaidAmount", e.target.value)} />
        </Field>
        <Field label="发票金额">
          <input type="number" step="0.01" className="input num" value={form.invoiceAmount} onChange={(e) => update("invoiceAmount", e.target.value)} />
        </Field>
        <Field label="公司报销金额">
          <input type="number" step="0.01" className="input num" value={form.reimbursedAmount} onChange={(e) => update("reimbursedAmount", e.target.value)} />
        </Field>
        <Field label="其他成本">
          <input type="number" step="0.01" className="input num" value={form.otherCost} onChange={(e) => update("otherCost", e.target.value)} />
        </Field>
        <Field label="退款金额">
          <input type="number" step="0.01" className="input num" value={form.refundAmount} onChange={(e) => update("refundAmount", e.target.value)} />
        </Field>
        <Field label="税点（例：0.06）">
          <input
            type="number"
            step="0.001"
            className="input num"
            value={form.taxRate}
            onChange={(e) => update("taxRate", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="发票与报销信息">
        <Field label="发票抬头">
          <input className="input" value={form.invoiceTitle} onChange={(e) => update("invoiceTitle", e.target.value)} />
        </Field>
        <Field label="税号">
          <input className="input" value={form.taxNo} onChange={(e) => update("taxNo", e.target.value)} />
        </Field>
        <Field label="发票类型">
          <select className="select" value={form.invoiceType} onChange={(e) => update("invoiceType", e.target.value)}>
            <option value="">（未指定）</option>
            {INVOICE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="发票号码">
          <input className="input" value={form.invoiceNo} onChange={(e) => update("invoiceNo", e.target.value)} />
        </Field>
        <Field label="开票日期">
          <input type="date" className="input" value={form.invoiceDate} onChange={(e) => update("invoiceDate", e.target.value)} />
        </Field>
        <Field label="报销状态">
          <select className="select" value={form.reimbursementStatus} onChange={(e) => update("reimbursementStatus", e.target.value)}>
            {REIMBURSEMENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="报销日期">
          <input type="date" className="input" value={form.reimbursementDate} onChange={(e) => update("reimbursementDate", e.target.value)} />
        </Field>
        <Field label="报销备注" full>
          <textarea
            className="textarea"
            rows={2}
            value={form.reimbursementRemark}
            onChange={(e) => update("reimbursementRemark", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="附件与备注">
        <Field label="备注" full>
          <textarea
            className="textarea"
            rows={3}
            value={form.remark}
            onChange={(e) => update("remark", e.target.value)}
          />
        </Field>
        <div className="col-span-full text-[12px] text-[var(--muted)]">
          附件可以在订单详情页添加（MVP 阶段填写名称 + 类型 + 链接/路径即可）。
        </div>
      </Section>

      {error && <div className="alert-anomaly">{error}</div>}

      <div className="flex gap-2 justify-end pb-6">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          取消
        </button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "保存中…" : mode === "create" ? "创建订单" : "保存修改"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold mb-4 text-zinc-700">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-3" : ""}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-[12px] text-[var(--muted)] mb-1">{label}</div>
      <Money value={value} className="text-base" />
    </div>
  );
}

function SummaryBalance({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[12px] text-[var(--muted)] mb-1">{label}</div>
      <Money value={value} asBalance className="text-base" />
    </div>
  );
}

