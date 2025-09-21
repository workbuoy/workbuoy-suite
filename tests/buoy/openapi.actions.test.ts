import { execute } from "../../src/buoy/actions";
import { plan } from "../../src/buoy/reasoning/planner";
import type { BuoyContext } from "../../src/buoy/memory/context";

describe("Buoy OpenAPI action layer", () => {
  const ctx: BuoyContext = { correlationId: "corr", roleId: "ops", autonomyLevel: 2 } as any;

  afterEach(() => {
    delete process.env.BUOY_ACTION_ALLOWLIST;
    delete process.env.BUOY_OPENAPI_PATH;
    delete process.env.BUOY_ACTION_BASE_URL;
    delete process.env.BUOY_ACTION_API_KEY;
    (global.fetch as any) = undefined;
  });

  it("executes allowlisted CRM list via OpenAPI", async () => {
    process.env.BUOY_ACTION_ALLOWLIST = "ai/policy/tool_allowlist.yaml";
    process.env.BUOY_OPENAPI_PATH = "openapi/openapi.yaml";
    process.env.BUOY_ACTION_BASE_URL = "https://example.test";

    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: () => Promise.resolve("{\"items\":[]}"),
    };
    const fetchSpy = jest.fn(async () => mockResponse as any);
    (global.fetch as any) = fetchSpy;

    const planRes = await plan("crm.contacts.list", ctx, {});
    expect(planRes.action).toBe("openapi.call");
    expect(planRes.call).toBeDefined();

    const result = await execute(planRes.action, { ...ctx, params: {}, plan: planRes });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/crm/contacts"),
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toMatchObject({ ok: true, status: 200 });
  });

  it("falls back to noop when intent unknown", async () => {
    const planRes = await plan("unknown.intent", ctx, {});
    expect(planRes.action).toBe("noop");
    const result = await execute(planRes.action, { ...ctx, params: { hello: "world" }, plan: planRes });
    expect(result).toHaveProperty("ok", true);
    expect((result as any).echo).toEqual({ hello: "world" });
  });
});
