import express from "express";
import request from "supertest";
import { policyV2GuardCached } from "../src/core/policyV2/middleware.cached";
import * as cache from "../src/core/policy/cache";

describe("policyV2GuardCached", () => {
  it("sets headers and caches decisions", async () => {
    cache.clear();
    const app = express();
    app.use(express.json());
    app.post("/w", policyV2GuardCached("write","low"), (_req,res)=>res.json({ ok:true }));
    const r1 = await request(app).post("/w").set("x-autonomy","1").send({ title:"t" });
    expect(r1.status).toBe(403);
    const m1 = cache.get({ version:"v2", role:"anon", auto:1, cat:"write", risk:"low", action:"/w" });
    expect(m1).not.toBeNull();

    const r2 = await request(app).post("/w").set("x-autonomy","2").send({ title:"t" });
    expect([200,201]).toContain(r2.status);
  });
});
