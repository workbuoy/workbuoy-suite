import request from "supertest";
import app from "../../apps/backend/src/server";

describe("POST /buoy/complete", () => {
  it("returns 200 for echo intent", async () => {
    const res = await request(app)
      .post("/buoy/complete")
      .set("Content-Type", "application/json")
      .set("x-autonomy", "2")
      .send({ intent: "echo", params: { x: 1 } });
    expect(res.status).toBe(200);
    expect(res.body?.result?.ok).toBe(true);
    expect(res.body?.correlationId).toBeDefined();
  });

  it("returns 400 on missing intent", async () => {
    const res = await request(app)
      .post("/buoy/complete")
      .set("Content-Type", "application/json")
      .send({});
    expect(res.status).toBe(400);
  });
});
