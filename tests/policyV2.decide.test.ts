import { decide } from "../src/core/policyV2/evaluate";

describe("policy v2 decide()", () => {
  it("allows read at autonomy 0", () => {
    const d = decide({ autonomyLevel: 0, category: "read" });
    expect(d.allow).toBe(true);
  });

  it("denies low-risk write at autonomy 1", () => {
    const d = decide({ autonomyLevel: 1, category: "write", risk: "low" });
    expect(d.allow).toBe(false);
    expect(d.mode).toBeDefined();
  });

  it("requires autonomy >=2 for low-risk write", () => {
    const d = decide({ autonomyLevel: 2, category: "write", risk: "low" });
    expect(d.allow).toBe(true);
  });
});
