"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Money } from "@/components/Money";
import { formatDateCN } from "@/lib/dates";

type AgentRow = {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  wechat: string | null;
  email: string | null;
  defaultAgentFee: number | null;
  remark: string | null;
  enabled: boolean;
  _count: { orders: number };
  actualPaidSum: number;
  agentFeeSum: number;
  orders: {
    id: string;
    orderNo: string;
    passengerName: string;
    route: string;
    actualPaidAmount: number | null;
    createdAt: Date | string;
  }[];
};

type Editing = {
  id?: string;
  name: string;
  contactPerson: string;
  phone: string;
  wechat: string;
  email: string;
  defaultAgentFee: string;
  remark: string;
  enabled: boolean;
};

const empty = (): Editing => ({
  name: "",
  contactPerson: "",
  phone: "",
  wechat: "",
  email: "",
  defaultAgentFee: "",
  remark: "",
  enabled: true,
});

export function AgentsManager({ initialAgents }: { initialAgents: AgentRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [selected, setSelected] = useState<string | null>(initialAgents[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startCreate = () => {
    setEditing(empty());
    setError(null);
  };

  const startEdit = (a: AgentRow) => {
    setEditing({
      id: a.id,
      name: a.name,
      contactPerson: a.contactPerson ?? "",
      phone: a.phone ?? "",
      wechat: a.wechat ?? "",
      email: a.email ?? "",
      defaultAgentFee: a.defaultAgentFee != null ? String(a.defaultAgentFee) : "",
      remark: a.remark ?? "",
      enabled: a.enabled,
    });
    setError(null);
  };

  const cancel = () => setEditing(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    const url = editing.id ? `/api/agents/${editing.id}` : `/api/agents`;
    const method = editing.id ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "保存失败");
        setSubmitting(false);
        return;
      }
      setEditing(null);
      setSubmitting(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
      setSubmitting(false);
    }
  };

  const remove = async (a: AgentRow) => {
    if (a._count.orders > 0) {
      alert(`该代理还有 ${a._count.orders} 条关联订单，请先解除关联再删除。`);
      return;
    }
    if (!confirm(`确认删除代理「${a.name}」？`)) return;
    const res = await fetch(`/api/agents/${a.id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "删除失败");
      return;
    }
    router.refresh();
  };

  const sel = initialAgents.find((a) => a.id === selected) ?? initialAgents[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-4">
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={startCreate}>+ 新增代理</button>
        </div>

        {editing && (
          <form onSubmit={submit} className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-700">
              {editing.id ? "编辑代理" : "新增代理"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">代理名称 *</label>
                <input
                  className="input"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">联系人</label>
                <input
                  className="input"
                  value={editing.contactPerson}
                  onChange={(e) => setEditing({ ...editing, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <label className="label">电话</label>
                <input
                  className="input"
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label">微信</label>
                <input
                  className="input"
                  value={editing.wechat}
                  onChange={(e) => setEditing({ ...editing, wechat: e.target.value })}
                />
              </div>
              <div>
                <label className="label">邮箱</label>
                <input
                  className="input"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">默认服务费</label>
                <input
                  type="number"
                  step="0.01"
                  className="input num"
                  value={editing.defaultAgentFee}
                  onChange={(e) => setEditing({ ...editing, defaultAgentFee: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">备注</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={editing.remark}
                  onChange={(e) => setEditing({ ...editing, remark: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editing.enabled}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                />
                <label htmlFor="enabled" className="text-sm">启用</label>
              </div>
            </div>
            {error && <div className="alert-anomaly">{error}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={cancel} disabled={submitting}>
                取消
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "保存中…" : "保存"}
              </button>
            </div>
          </form>
        )}

        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>名称</th>
                <th>联系人</th>
                <th>电话 / 微信</th>
                <th className="num">默认服务费</th>
                <th className="num">订单数</th>
                <th className="num">累计付款</th>
                <th>状态</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {initialAgents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-[var(--muted)] py-6">
                    暂无代理。点击右上角「新增代理」开始。
                  </td>
                </tr>
              ) : (
                initialAgents.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a.id)}
                    className={
                      "cursor-pointer " +
                      (a.id === sel?.id ? "bg-blue-50/40" : "")
                    }
                  >
                    <td className="font-medium">{a.name}</td>
                    <td>{a.contactPerson ?? "—"}</td>
                    <td>
                      <div className="text-sm">{a.phone ?? "—"}</div>
                      <div className="text-xs text-[var(--muted)]">{a.wechat ?? ""}</div>
                    </td>
                    <td className="num">
                      <Money value={a.defaultAgentFee} />
                    </td>
                    <td className="num">{a._count.orders}</td>
                    <td className="num">
                      <Money value={a.actualPaidSum} />
                    </td>
                    <td>
                      {a.enabled ? (
                        <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">启用</span>
                      ) : (
                        <span className="chip bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200">停用</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-[var(--accent)] text-sm hover:underline" onClick={(e) => { e.stopPropagation(); startEdit(a); }}>
                          编辑
                        </button>
                        <button className="text-rose-600 text-sm hover:underline" onClick={(e) => { e.stopPropagation(); remove(a); }}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-2">
        {sel ? (
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-3 text-zinc-700">代理详情</h3>
            <div className="space-y-2 text-sm">
              <div className="text-lg font-semibold">{sel.name}</div>
              <div className="text-[var(--muted)]">{sel.remark || "—"}</div>
              <div className="grid grid-cols-3 gap-4 pt-3">
                <div>
                  <div className="text-[12px] text-[var(--muted)]">订单数</div>
                  <div className="text-base font-semibold">{sel._count.orders}</div>
                </div>
                <div>
                  <div className="text-[12px] text-[var(--muted)]">累计付款</div>
                  <Money value={sel.actualPaidSum} className="text-base" />
                </div>
                <div>
                  <div className="text-[12px] text-[var(--muted)]">累计服务费</div>
                  <Money value={sel.agentFeeSum} className="text-base" />
                </div>
              </div>
              <div className="pt-3">
                <div className="text-[12px] text-[var(--muted)] mb-2">最近订单</div>
                {sel.orders.length === 0 ? (
                  <div className="text-sm text-[var(--muted)]">暂无订单</div>
                ) : (
                  <ul className="space-y-1">
                    {sel.orders.map((o) => (
                      <li key={o.id} className="text-sm flex justify-between items-center border-b border-zinc-100 py-1">
                        <Link href={`/orders/${o.id}`} className="text-[var(--accent)] hover:underline">
                          {o.orderNo}
                        </Link>
                        <span className="text-zinc-600">{o.passengerName} · {o.route}</span>
                        <span className="text-[var(--muted)] text-xs">{formatDateCN(o.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-5 text-sm text-[var(--muted)]">从左侧选择一个代理查看详情</div>
        )}
      </div>
    </div>
  );
}
