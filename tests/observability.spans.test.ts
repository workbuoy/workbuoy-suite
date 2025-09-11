import { withSpan } from "../src/core/observability/spans";

describe("withSpan", () => {
  it("logs duration_ms", async () => {
    const logs:any[] = [];
    const res = await withSpan("unit", async () => { return 42; }, (o)=>logs.push(o));
    expect(res).toBe(42);
    expect(logs[0].span).toBe("unit");
    expect(typeof logs[0].duration_ms).toBe("number");
  });
});
