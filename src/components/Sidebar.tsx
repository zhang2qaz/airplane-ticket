"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "仪表盘", icon: "📊" },
  { href: "/orders", label: "机票订单", icon: "✈️" },
  { href: "/agents", label: "代理管理", icon: "🤝" },
  { href: "/reimbursements", label: "报销记录", icon: "📑" },
  { href: "/export", label: "数据导出", icon: "📤" },
  { href: "/settings", label: "设置", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-[var(--border)] flex flex-col">
      <div className="h-14 flex items-center px-5 border-b border-[var(--border)]">
        <div className="text-base font-semibold tracking-tight">机票台账</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors " +
                (active
                  ? "bg-[var(--accent)] text-white"
                  : "text-zinc-700 hover:bg-zinc-100")
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-[11px] text-zinc-400 border-t border-[var(--border)]">
        个人记账 · MVP
      </div>
    </aside>
  );
}
