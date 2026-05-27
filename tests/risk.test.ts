import { describe, it, expect } from "vitest";
import { assessRisk } from "@/lib/risk";

describe("assessRisk", () => {
  it("三个金额齐全且无异常 → NORMAL", () => {
    const r = assessRisk({
      actualPaidAmount: 1000,
      invoiceAmount: 1000,
      reimbursedAmount: 1000,
    });
    expect(r.level).toBe("NORMAL");
  });

  it("invoice > actualPaid → 至少 WATCH", () => {
    const r = assessRisk({
      actualPaidAmount: 800,
      invoiceAmount: 1000,
      reimbursedAmount: 800,
    });
    expect(r.level).toBe("WATCH");
    expect(r.reasons.join()).toContain("发票金额高于真实付款");
  });

  it("reimbursed > actualPaid → 至少 WATCH", () => {
    const r = assessRisk({
      actualPaidAmount: 800,
      invoiceAmount: 1000,
      reimbursedAmount: 900,
    });
    expect(r.level).toBe("WATCH");
  });

  it("reimbursed > invoice → ABNORMAL", () => {
    const r = assessRisk({
      actualPaidAmount: 800,
      invoiceAmount: 900,
      reimbursedAmount: 1000,
    });
    expect(r.level).toBe("ABNORMAL");
    expect(r.reasons.join()).toContain("报销金额高于发票金额");
  });

  it("netBalance < 0 → 至少 WATCH", () => {
    // 真实付款 1000，报销 800 → net = -200
    const r = assessRisk({
      actualPaidAmount: 1000,
      invoiceAmount: 1000,
      reimbursedAmount: 800,
    });
    expect(r.level).toBe("WATCH");
  });

  it("任一金额缺失 → 至少 WATCH", () => {
    const r1 = assessRisk({ actualPaidAmount: 1000, invoiceAmount: 1000 });
    expect(r1.level).toBe("WATCH");
    const r2 = assessRisk({ actualPaidAmount: 1000, reimbursedAmount: 1000 });
    expect(r2.level).toBe("WATCH");
    const r3 = assessRisk({ invoiceAmount: 1000, reimbursedAmount: 1000 });
    expect(r3.level).toBe("WATCH");
  });

  it("空对象 → WATCH（缺失）而不是崩", () => {
    const r = assessRisk({});
    expect(r.level).toBe("WATCH");
  });

  it("0 金额不算缺失", () => {
    const r = assessRisk({
      actualPaidAmount: 0,
      invoiceAmount: 0,
      reimbursedAmount: 0,
    });
    expect(r.level).toBe("NORMAL");
  });
});
