import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Registry } from "prom-client";
import {
  createCounter,
  createHistogram,
  getMetricsText,
  getOpenMetricsText,
  getRegistry,
} from "../src/index.js";

function uniqueMetricName(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

test("createCounter registers against default registry by default", async () => {
  const registry = getRegistry();
  const name = uniqueMetricName("wb_test_counter_total");
  const counter = createCounter({ name, help: "test counter", labelNames: ["foo"] });
  counter.inc({ foo: "bar" });

  const metric = registry.getSingleMetric(name);
  assert.ok(metric, "counter registered in default registry");
  const snapshot = await metric.get();
  const value = snapshot.values.find((entry) => entry.labels.foo === "bar");
  assert.equal(value?.value, 1);
});

test("createHistogram supports custom registry", async () => {
  const registry = new Registry();
  const name = uniqueMetricName("wb_test_histogram_seconds");
  const histogram = createHistogram({
    name,
    help: "test histogram",
    buckets: [0.1, 0.5, 1],
    registry,
  });
  histogram.observe(0.4);

  assert.ok(registry.getSingleMetric(name), "histogram registered on provided registry");
  const snapshot = await histogram.get();
  const sum = snapshot.values.find((entry) => entry.metricName.endsWith("_sum"));
  assert.equal(sum?.value, 0.4);
});

test("getMetricsText returns merged metrics output", async () => {
  const registry = new Registry();
  const name = uniqueMetricName("wb_test_metrics_text_total");
  const counter = createCounter({
    name,
    help: "metrics text counter",
    labelNames: ["label"],
    registry,
  });
  counter.inc({ label: "value" });

  const text = await getMetricsText([registry]);
  assert.equal(typeof text, "string");
  assert.ok(text.includes(name), "metrics output contains counter name");
});

test("getOpenMetricsText returns merged metrics output", async () => {
  const registry = new Registry();
  const name = uniqueMetricName("wb_test_openmetrics_total");
  const counter = createCounter({
    name,
    help: "openmetrics counter",
    labelNames: ["foo"],
    registry,
  });
  counter.inc({ foo: "bar" });

  const text = await getOpenMetricsText([registry]);
  assert.equal(typeof text, "string");
  assert.ok(text.includes(name), "open metrics output contains counter name");
});
