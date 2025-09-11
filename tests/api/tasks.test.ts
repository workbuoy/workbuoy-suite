import request from "supertest";
import app from "../../src/server";

describe("Tasks API (in-memory)", () => {
  it("CRUD @ autonomy 2", async () => {
    const c = await request(app).post("/api/tasks").set("x-autonomy","2").send({ title:"A" });
    expect([200,201]).toContain(c.status);
    const id = c.body.item.id;
    const u = await request(app).patch(`/api/tasks/${id}`).set("x-autonomy","2").send({ status:"doing" });
    expect(u.status).toBe(200);
    const g = await request(app).get("/api/tasks?status=doing");
    expect(g.status).toBe(200);
    const d = await request(app).delete(`/api/tasks/${id}`).set("x-autonomy","2");
    expect(d.status).toBe(204);
  });
  it("denies write @ autonomy 1", async () => {
    const r = await request(app).post("/api/tasks").set("x-autonomy","1").send({ title:"X" });
    expect(r.status).toBe(403);
  });
});
