import request from "supertest";
import app from "../src/server";

describe("Log API (MVP)", () => {
  it("appends a log at autonomy 2", async () => {
    const res = await request(app).post("/api/log").set("x-autonomy","2").send({ level: "info", msg: "hello" });
    expect(res.status).toBe(201);
    expect(res.body.item.msg).toBe("hello");
    expect(res.body.item.hash).toBeDefined();
  });
  it("lists logs", async () => {
    const res = await request(app).get("/api/log");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
