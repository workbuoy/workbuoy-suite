import request from "supertest";
import app from "../apps/backend/src/server";

describe("Tasks API (MVP)", () => {
  it("creates a task at autonomy 2", async () => {
    const res = await request(app).post("/api/tasks").set("x-autonomy","2").send({ title: "Do X" });
    expect(res.status).toBe(201);
    expect(res.body.item.title).toBe("Do X");
  });

  it("denies create at autonomy 0", async () => {
    const res = await request(app).post("/api/tasks").set("x-autonomy","0").send({ title: "Nope" });
    expect(res.status).toBe(403);
  });

  it("lists tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
