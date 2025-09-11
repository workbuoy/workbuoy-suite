import { verifyHashChain } from "../src/core/auditVerify";

describe("audit hashchain verify()", () => {
  it("returns ok=true on valid chain", () => {
    const chain = [
      { hash: "a", prevHash: null },
      { hash: "b", prevHash: "a" },
      { hash: "c", prevHash: "b" },
    ];
    expect(verifyHashChain(chain).ok).toBe(true);
  });

  it("detects broken link", () => {
    const chain = [
      { hash: "a", prevHash: null },
      { hash: "b", prevHash: "WRONG" }, // should be 'a'
    ];
    const res = verifyHashChain(chain);
    expect(res.ok).toBe(false);
    expect(res.brokenAt).toBe(1);
  });
});
