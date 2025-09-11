import express from "express";
import request from "supertest";
import { policyV2GuardCached } from "../src/core/policyV2/middleware.cached";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post("/buoy/complete", policyV2GuardCached("read","low"), async (_req, res) => {
    // simulate minimal agent work
    await new Promise(r => setTimeout(r, 2));
    res.json({ ok: true, explanations: [], correlationId: "x" });
  });
  return app;
}

function p95(arr:number[]) {
  const sorted = [...arr].sort((a,b)=>a-b);
  const idx = Math.floor(0.95 * (sorted.length - 1));
  return sorted[idx];
}

describe("latency smoke (no external calls)", () => {
  it("p95 < 350ms for 50 parallel requests", async () => {
    const app = buildApp();
    const N = 50;
    const t: number[] = [];
    const reqs = Array.from({length:N}).map(async () => {
      const t0 = Date.now();
      const r = await request(app).post("/buoy/complete").set("x-autonomy","2").send({ intent:"echo" });
      expect(r.status).toBe(200);
      t.push(Date.now() - t0);
    });
    await Promise.all(reqs);
    const p = p95(t);
    // Non-flaky threshold; adjust if your CI runners are slow
    expect(p).toBeLessThan(350);
  }, 15000);
});
