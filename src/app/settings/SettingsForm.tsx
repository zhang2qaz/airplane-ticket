"use client";

import { useState } from "react";

export function SettingsForm({
  initial,
}: {
  initial: { defaultTaxRate: number; currency: string };
}) {
  const [taxRate, setTaxRate] = useState(String(initial.defaultTaxRate));
  const [currency, setCurrency] = useState(initial.currency);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultTaxRate: taxRate, currency }),
    });
    setSubmitting(false);
    if (res.ok) setMsg("已保存");
    else setMsg("保存失败");
  };

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div>
        <label className="label">默认税点</label>
        <input
          type="number"
          step="0.001"
          className="input num"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
        />
        <div className="text-[11px] text-[var(--muted)] mt-1">
          新增订单时会自动填入；例：0.06 表示 6%
        </div>
      </div>
      <div>
        <label className="label">货币代码</label>
        <input
          className="input"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
        <div className="text-[11px] text-[var(--muted)] mt-1">
          目前仅用于展示，默认 CNY
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "保存中…" : "保存"}
        </button>
        {msg && <span className="text-sm text-[var(--muted)]">{msg}</span>}
      </div>
    </form>
  );
}
