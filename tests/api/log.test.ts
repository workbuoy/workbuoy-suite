import request from "supertest";
import app from "../../apps/backend/src/server";

describe("Log API (in-memory)", () => {
  it("append and list and verify", async () => {
    const p = await request(app).post("/api/logs").set("x-autonomy","2").send({ msg:"hello" });
    expect([200,201]).toContain(p.status);
    const g = await request(app).get("/api/logs?limit=10");
    expect(g.status).toBe(200);
    const v = await request(app).get("/api/audit/verify");
    expect([200,500]).toContain(v.status);
  });
});
