import { plan } from "../../src/buoy/reasoning/planner";
import type { BuoyContext } from "../../src/buoy/memory/context";

describe("planner", () => {
  const ctx: BuoyContext = { correlationId: "c", roleId: "ops", autonomyLevel: 2 } as any;

  it("builds direct openapi plan from params", async () => {
    const res = await plan("api.call", ctx, {
      method: "POST",
      path: "/api/v1/geo/geocode",
      body: { addresses: ["Oslo"] },
      rationale: "Geocode single address",
      confidence: 0.8,
    });
    expect(res.action).toBe("openapi.call");
    expect(res.call).toMatchObject({ method: "POST", path: "/api/v1/geo/geocode" });
    expect(res.confidence).toBeCloseTo(0.8);
  });

  it("builds mapped plan for CRM", async () => {
    const res = await plan("crm.contacts.delete", ctx, { id: "123" });
    expect(res.action).toBe("openapi.call");
    expect(res.call).toMatchObject({ method: "DELETE", path: expect.stringContaining("/api/v1/crm/contacts/123") });
  });
});
