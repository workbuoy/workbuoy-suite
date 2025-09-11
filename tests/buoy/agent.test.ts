import { run } from "../../src/buoy/agent";

function mockReq(headers: Record<string,string> = {}) {
  return { headers } as any;
}

describe("Buoy agent (MVP)", () => {
  it("echo intent produces ok result and explanation", async () => {
    const res = await run({ intent: "echo", params: { ping: "pong" } }, mockReq({ "x-autonomy": "2" }));
    expect(res).toHaveProperty("result.ok", true);
    expect(res).toHaveProperty("result.echo.ping", "pong");
    expect(Array.isArray(res.explanations)).toBe(true);
    expect(typeof res.correlationId).toBe("string");
  });
});
