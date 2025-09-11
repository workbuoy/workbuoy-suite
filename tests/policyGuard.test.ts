import request from "supertest";
import app from "../src/server";

describe("policyGuard autonomy 0-2", () => {
  it("denies write at autonomy 0", async () => {
    const res = await request(app).post("/api/crm/contacts").set("x-autonomy","0").send({ name: "A" });
    expect(res.status).toBe(403);
  });
  it("allows POST at autonomy 2", async () => {
    const res = await request(app).post("/api/crm/contacts").set("x-autonomy","2").send({ name: "B" });
    expect(res.status).toBe(201);
    expect(res.body.item.name).toBe("B");
  });
});
