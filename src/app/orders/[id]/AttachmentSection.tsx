"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ATTACHMENT_TYPE, ATTACHMENT_TYPE_OPTIONS } from "@/lib/enums";

type Attachment = {
  id: string;
  name: string;
  type: string;
  url: string;
  remark: string | null;
  createdAt: Date | string;
};

export function AttachmentSection({
  orderId,
  attachments,
}: {
  orderId: string;
  attachments: Attachment[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", type: "OTHER", url: "", remark: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...form }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "添加失败");
        setSubmitting(false);
        return;
      }
      setForm({ name: "", type: "OTHER", url: "", remark: "" });
      setSubmitting(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确认删除此附件？")) return;
    const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "删除失败");
      return;
    }
    router.refresh();
  };

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold mb-3 text-zinc-700">附件管理</h3>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-3">
          <label className="label">附件名称</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例：行程单.pdf"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">类型</label>
          <select
            className="select"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {ATTACHMENT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <label className="label">链接 / 路径</label>
          <input
            className="input"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://… 或 /path/to/file"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">备注</label>
          <input
            className="input"
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
          />
        </div>
        <div className="md:col-span-1 flex items-end">
          <button className="btn btn-primary w-full" type="submit" disabled={submitting}>
            添加
          </button>
        </div>
      </form>

      {error && <div className="alert-anomaly mb-3">{error}</div>}

      {attachments.length === 0 ? (
        <div className="text-sm text-[var(--muted)]">暂无附件</div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>链接 / 路径</th>
              <th>备注</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {attachments.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{ATTACHMENT_TYPE[a.type] ?? a.type}</td>
                <td className="break-all">
                  {a.url.startsWith("http") ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                    >
                      {a.url}
                    </a>
                  ) : (
                    <span className="text-zinc-600">{a.url}</span>
                  )}
                </td>
                <td>{a.remark ?? "—"}</td>
                <td>
                  <button
                    className="text-rose-600 text-sm hover:underline"
                    onClick={() => remove(a.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
