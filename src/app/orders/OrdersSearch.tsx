"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ORDER_STATUS_OPTIONS, REIMBURSEMENT_STATUS_OPTIONS } from "@/lib/enums";

export function OrdersSearch({
  defaultQ,
  defaultStatus,
  defaultReimb,
}: {
  defaultQ: string;
  defaultStatus: string;
  defaultReimb: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(defaultQ);
  const [status, setStatus] = useState(defaultStatus);
  const [reimb, setReimb] = useState(defaultReimb);
  const [pending, startTransition] = useTransition();

  const apply = (overrides?: { q?: string; status?: string; reimb?: string }) => {
    const params = new URLSearchParams(sp?.toString() ?? "");
    const _q = overrides?.q ?? q;
    const _s = overrides?.status ?? status;
    const _r = overrides?.reimb ?? reimb;
    if (_q) params.set("q", _q);
    else params.delete("q");
    if (_s) params.set("status", _s);
    else params.delete("status");
    if (_r) params.set("reimbursement", _r);
    else params.delete("reimbursement");
    startTransition(() => router.push(`/orders?${params.toString()}`));
  };

  const reset = () => {
    setQ("");
    setStatus("");
    setReimb("");
    startTransition(() => router.push("/orders"));
  };

  return (
    <form
      className="card p-4 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex-1 min-w-[220px]">
        <label className="label">搜索（订单号 / 出行人 / 航线 / PNR / 票号 / 航司 / 代理）</label>
        <input
          className="input"
          placeholder="输入关键字"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="min-w-[140px]">
        <label className="label">订单状态</label>
        <select
          className="select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            apply({ status: e.target.value });
          }}
        >
          <option value="">全部</option>
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[140px]">
        <label className="label">报销状态</label>
        <select
          className="select"
          value={reimb}
          onChange={(e) => {
            setReimb(e.target.value);
            apply({ reimb: e.target.value });
          }}
        >
          <option value="">全部</option>
          {REIMBURSEMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={pending}>
          搜索
        </button>
        <button className="btn btn-secondary" type="button" onClick={reset} disabled={pending}>
          清空
        </button>
      </div>
    </form>
  );
}
