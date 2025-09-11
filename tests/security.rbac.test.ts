import request from "supertest";
import express from "express";
import { rbac } from "../src/core/security/rbac";

describe("rbac middleware", () => {
  it("denies anon", async () => {
    const app = express();
    app.get("/admin", rbac(["admin"]), (_req, res) => res.json({ ok: true }));
    const res = await request(app).get("/admin");
    expect(res.status).toBe(403);
  });

  it("allows admin", async () => {
    const app = express();
    app.get("/admin", rbac(["admin"]), (_req, res) => res.json({ ok: true }));
    const res = await request(app).get("/admin").set("x-role-id", "admin");
    expect(res.status).toBe(200);
  });
});
