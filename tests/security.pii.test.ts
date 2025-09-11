import { maskPII } from "../src/core/security/pii";

describe("maskPII", () => {
  it("masks known PII fields", () => {
    const src = { email: "a@x.com", nested: { phone: "123" }, ok: 1 };
    const out = maskPII(src);
    expect(out.email).toBe("***");
    expect(out.nested.phone).toBe("***");
    expect(out.ok).toBe(1);
  });
});
