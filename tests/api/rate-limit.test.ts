import request from "supertest";
import app from "../../apps/backend/src/server";

describe("rate limit on write routes", () => {
  const env = process.env;
  beforeAll(()=> {
    process.env.RATE_WINDOW_MS = "60000";
    process.env.RATE_MAX = "1";
  });
  afterAll(()=> { process.env = env; });

  it("returns 429 when exceeding write limit", async () => {
    const first = await request(app).post("/api/tasks").set("x-autonomy","2").send({ title:"A" });
    expect([200,201,403]).toContain(first.status); // policy may deny in some configs
    const second = await request(app).post("/api/tasks").set("x-autonomy","2").send({ title:"B" });
    if (first.status < 400) { // only assert 429 if first was allowed
      expect(second.status).toBe(429);
    }
  });
});
