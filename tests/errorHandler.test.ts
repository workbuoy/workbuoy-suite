import request from "supertest";
import app from "../src/server";

describe("errorHandler + correlationId", () => {
  it("returns correlationId on 404 from delete", async () => {
    const res = await request(app).delete("/api/crm/contacts/does-not-exist").set("x-autonomy","2");
    expect(res.status).toBe(404);
    expect(res.body.correlationId || res.headers["x-correlation-id"]).toBeDefined();
  });
});
