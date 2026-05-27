"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteOrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    if (!confirm("确认删除此订单？此操作不可恢复。")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? "删除失败");
        setPending(false);
        return;
      }
      router.push("/orders");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
      setPending(false);
    }
  };

  return (
    <button className="btn btn-danger" onClick={onClick} disabled={pending}>
      {pending ? "删除中…" : "删除"}
    </button>
  );
}
