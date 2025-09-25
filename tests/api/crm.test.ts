import request from "supertest";
import app from "../../apps/backend/src/server";

describe("CRM Contacts API (in-memory)", () => {
  it("GET list 200", async () => {
    const r = await request(app).get("/api/crm/contacts");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body.items)).toBe(true);
  });
  it("POST denied at autonomy 1", async () => {
    const r = await request(app).post("/api/crm/contacts").set("x-autonomy","1").send({ name:"X" });
    expect(r.status).toBe(403);
  });
  it("POST creates at autonomy 2", async () => {
    const r = await request(app).post("/api/crm/contacts").set("x-autonomy","2").send({ name:"Y" });
    expect([200,201]).toContain(r.status);
  });
  it("DELETE requires autonomy 2", async () => {
    const c = await request(app).post("/api/crm/contacts").set("x-autonomy","2").send({ name:"Z" });
    const id = c.body.item.id;
    const d = await request(app).delete(`/api/crm/contacts/${id}`).set("x-autonomy","1");
    expect(d.status).toBe(403);
    const d2 = await request(app).delete(`/api/crm/contacts/${id}`).set("x-autonomy","2");
    expect(d2.status).toBe(204);
  });
});
