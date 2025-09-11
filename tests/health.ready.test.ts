import request from "supertest";
import app from "../src/server";

describe("health & readiness", () => {
  it("GET /healthz returns 200", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /metrics returns 200 (text)", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/http_request_duration_seconds_bucket/);
  });
});
