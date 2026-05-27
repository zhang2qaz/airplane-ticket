import { formatCNY } from "@/lib/money";

type MoneyProps = {
  value: number | null | undefined;
  /** 当值为负数时显示为警告色 */
  warnNegative?: boolean;
  /** 视为「结余」字段：正数浅绿、负数浅红 */
  asBalance?: boolean;
  className?: string;
};

export function Money({ value, warnNegative, asBalance, className = "" }: MoneyProps) {
  const v = value ?? 0;
  let color = "";
  if (asBalance) {
    if (v > 0) color = "text-emerald-600";
    else if (v < 0) color = "text-rose-600 font-semibold";
  } else if (warnNegative && v < 0) {
    color = "text-rose-600 font-semibold";
  }
  return <span className={`num ${color} ${className}`}>{formatCNY(v)}</span>;
}
