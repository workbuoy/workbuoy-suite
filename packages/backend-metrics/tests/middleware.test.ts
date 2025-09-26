import { strict as assert } from "node:assert";
import { test } from "node:test";
import express from "express";
import request from "supertest";
import { Registry } from "prom-client";
import { withMetrics } from "../src/index.js";

test("records request counts and latency", async () => {
  const registry = new Registry();
  const app = express();
  app.use(withMetrics(registry));

  app.get("/ping", (_req, res) => {
    res.status(204).end();
  });

  await request(app).get("/ping").expect(204);
  await request(app).get("/ping").expect(204);

  const counter = registry.getSingleMetric("http_requests_total");
  assert.ok(counter, "counter registered");
  const counterSnapshot = await counter.get();
  const counterValues = counterSnapshot?.values ?? [];
  assert.equal(counterValues.length, 1);
  assert.equal(counterValues[0]?.value, 2);
  assert.deepEqual(counterValues[0]?.labels, {
    method: "GET",
    path: "/ping",
    status_code: "204",
  });

  const histogram = registry.getSingleMetric("http_request_duration_seconds");
  assert.ok(histogram, "histogram registered");
  const histogramSnapshot = await histogram.get();
  const summary = histogramSnapshot?.values.find((value) => value.metricName.endsWith("_sum"));
  assert.ok(summary, "histogram sum present");
  assert.ok((summary?.value ?? 0) >= 0, "histogram sum is non-negative");
});
