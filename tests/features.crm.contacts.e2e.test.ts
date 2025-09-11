import request from "supertest";
import app from "../src/server";

describe("CRM Contacts API", () => {
  it("lists empty", async () => {
    const r = await request(app).get("/api/crm/contacts");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body.items)).toBe(true);
  });
  it("denies create at autonomy 0/1", async () => {
    const r = await request(app).post("/api/crm/contacts").send({ name: "X" }).set("x-autonomy", "1");
    expect(r.status).toBe(403);
  });
  it("creates at autonomy 2", async () => {
    const r = await request(app).post("/api/crm/contacts").send({ name: "Y" }).set("x-autonomy", "2");
    expect([200,201]).toContain(r.status);
    expect(r.body?.item?.name).toBe("Y");
  });
});
