import { describe, it, expect } from "vitest";
import { computeDerived, formatCNY } from "@/lib/money";

describe("computeDerived", () => {
  it("税点成本 = invoiceAmount * taxRate", () => {
    const d = computeDerived({ invoiceAmount: 1000, taxRate: 0.06 });
    expect(d.taxCost).toBe(60);
  });

  it("税点成本 在空值时为 0", () => {
    expect(computeDerived({}).taxCost).toBe(0);
    expect(computeDerived({ invoiceAmount: null, taxRate: 0.06 }).taxCost).toBe(0);
    expect(computeDerived({ invoiceAmount: 1000 }).taxCost).toBe(0);
  });

  it("报销差额 = reimbursed - actualPaid", () => {
    expect(
      computeDerived({ actualPaidAmount: 800, reimbursedAmount: 1000 }).reimbursementDifference,
    ).toBe(200);
    expect(
      computeDerived({ actualPaidAmount: 1200, reimbursedAmount: 1000 }).reimbursementDifference,
    ).toBe(-200);
  });

  it("实际结余 = reimbursed - (actualPaid + agentFee + otherCost + taxCost - refund)", () => {
    const d = computeDerived({
      actualPaidAmount: 1000,
      invoiceAmount: 1000,
      reimbursedAmount: 1200,
      agentFee: 50,
      otherCost: 20,
      refundAmount: 100,
      taxRate: 0.06,
    });
    // taxCost = 60, total = 1000 + 50 + 20 + 60 - 100 = 1030, net = 1200 - 1030 = 170
    expect(d.taxCost).toBe(60);
    expect(d.totalActualCost).toBe(1030);
    expect(d.netBalance).toBe(170);
  });

  it("全部空值时不报错且不返回 NaN", () => {
    const d = computeDerived({});
    expect(d.taxCost).toBe(0);
    expect(d.totalActualCost).toBe(0);
    expect(d.reimbursementDifference).toBe(0);
    expect(d.netBalance).toBe(0);
  });

  it("undefined / NaN 都按 0 处理", () => {
    const d = computeDerived({
      actualPaidAmount: NaN,
      invoiceAmount: undefined,
      reimbursedAmount: 100,
    });
    expect(d.reimbursementDifference).toBe(100);
  });

  it("结果保留 2 位小数", () => {
    const d = computeDerived({ invoiceAmount: 333.33, taxRate: 0.06 });
    // 333.33 * 0.06 = 19.9998 → 20.00
    expect(d.taxCost).toBe(20);
  });
});

describe("formatCNY", () => {
  it("CNY 格式 + 2 位小数 + 千分位", () => {
    const s = formatCNY(12345.678);
    expect(s).toContain("12,345.68");
  });
  it("空值按 0 渲染", () => {
    expect(formatCNY(null)).toContain("0.00");
    expect(formatCNY(undefined)).toContain("0.00");
  });
});
