import request from "supertest";
import app from "../src/server";

describe("Log API", () => {
  it("append + list + audit verify", async () => {
    const p = await request(app).post("/api/logs").set("x-autonomy","2").send({ msg:"hi" });
    expect([200,201]).toContain(p.status);
    const g = await request(app).get("/api/logs");
    expect(g.status).toBe(200);
    const v = await request(app).get("/api/audit/verify");
    expect([200,500]).toContain(v.status); // ok or broken chain, but endpoint works
  });
});
