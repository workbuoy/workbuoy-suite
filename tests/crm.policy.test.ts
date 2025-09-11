import request from "supertest";
import app from "../src/server";

describe("CRM policy enforcement", () => {
  it("denies POST at autonomy 0", async () => {
    const res = await request(app)
      .post("/api/crm/contacts")
      .set("Content-Type", "application/json")
      .set("x-autonomy", "0")
      .send({ name: "Test" });
    expect([401, 403]).toContain(res.status);
  });

  it("allows POST at autonomy 2", async () => {
    const res = await request(app)
      .post("/api/crm/contacts")
      .set("Content-Type", "application/json")
      .set("x-autonomy", "2")
      .send({ name: "Ok" });
    expect([200, 201]).toContain(res.status);
  });
});
