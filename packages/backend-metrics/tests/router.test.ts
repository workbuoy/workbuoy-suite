import { strict as assert } from "node:assert";
import { test } from "node:test";
import express from "express";
import request from "supertest";
import { Registry } from "prom-client";
import { createMetricsRouter, withMetrics } from "../src/index.js";

test("/metrics endpoint exposes Prometheus output", async () => {
  const registry = new Registry();
  const app = express();
  withMetrics(app, { registry, enableDefaultMetrics: false });

  app.get("/hello", (_req, res) => {
    res.json({ ok: true });
  });

  const router = createMetricsRouter({ registry });
  app.use("/metrics", router);

  await request(app).get("/hello").expect(200);
  const response = await request(app).get("/metrics").expect(200);
  assert.match(response.headers["content-type"], /^text\/plain;.*version=0\.0\.4/);
  assert.match(response.text, /http_requests_total/);
  assert.match(response.text, /http_request_duration_seconds/);
});

