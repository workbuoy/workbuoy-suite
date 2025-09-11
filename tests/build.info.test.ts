import express from "express";
import request from "supertest";
import buildRoutes from "../src/core/http/routes/build";

describe("/buildz", () => {
  it("returns build info", async () => {
    const app = express(); app.use(buildRoutes);
    const r = await request(app).get("/buildz");
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("version");
  });
});
