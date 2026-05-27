import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "个人机票与报销台账",
  description: "个人机票、发票、报销和资金差额管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <header className="border-b border-[var(--border)] bg-white">
            <div className="px-8 h-14 flex items-center justify-between">
              <div className="text-sm text-[var(--muted)]">
                <Link href="/" className="hover:text-[var(--foreground)]">
                  个人机票与报销台账
                </Link>
              </div>
              <div className="text-xs text-[var(--muted)]">仅供个人记账与对账使用</div>
            </div>
          </header>
          <div className="flex-1 px-8 py-6 overflow-x-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
