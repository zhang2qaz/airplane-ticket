import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await prisma.setting.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", defaultTaxRate: 0.06, currency: "CNY" },
  });

  return (
    <div>
      <PageHeader title="设置" desc="全局默认值" />
      <div className="max-w-xl">
        <SettingsForm initial={{ defaultTaxRate: s.defaultTaxRate ?? 0.06, currency: s.currency }} />
      </div>
    </div>
  );
}
