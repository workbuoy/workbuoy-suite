import { buildTemplate, confidenceCompose } from "../src/core/explain/templates";

describe("explain templates", () => {
  it("composes confidence deterministically", () => {
    expect(confidenceCompose(1.0, 0.8, 0.7)).toBeCloseTo(0.56, 3);
  });
  it("returns templated explanation", () => {
    const e = buildTemplate({
      mode: "supervised", policy: 1.0, data: 0.8, risk: 0.7, basis: "autonomy=2; role=admin"
    });
    expect(e.confidence).toBeCloseTo(0.56, 3);
    expect(e.why_status).toBe("ok");
  });
});
