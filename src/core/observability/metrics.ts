import type { Request, RequestHandler, Response } from "express";
import { collectDefaultMetrics, Gauge, Histogram, Registry } from "prom-client";
import { bus } from "../eventBusV2.js";

const defaultRegistry = new Registry();
collectDefaultMetrics({ register: defaultRegistry });

const httpLabelNames = ["method", "route", "status_code"] as const;
type HttpLabel = (typeof httpLabelNames)[number];

type EventBusMetrics = {
  high: Gauge;
  medium: Gauge;
  low: Gauge;
  dlq: Gauge;
};

const httpMetricsByRegistry = new WeakMap<Registry, Histogram<HttpLabel>>();
const eventBusMetricsByRegistry = new WeakMap<Registry, EventBusMetrics>();

function ensureHttpHistogram(registry: Registry): Histogram<HttpLabel> {
  const existing = httpMetricsByRegistry.get(registry);
  if (existing) {
    return existing;
  }

  const histogram = new Histogram<HttpLabel>({
    name: "http_request_duration_seconds",
    help: "HTTP request duration",
    labelNames: httpLabelNames,
    registers: [registry],
    buckets: [0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
  });

  httpMetricsByRegistry.set(registry, histogram);
  return histogram;
}

function ensureEventBusMetrics(registry: Registry): EventBusMetrics {
  const existing = eventBusMetricsByRegistry.get(registry);
  if (existing) {
    return existing;
  }

  const high = new Gauge({
    name: "eventbus_queue_high",
    help: "Number of messages queued on the high priority event bus",
    registers: [registry],
  });
  const medium = new Gauge({
    name: "eventbus_queue_med",
    help: "Number of messages queued on the medium priority event bus",
    registers: [registry],
  });
  const low = new Gauge({
    name: "eventbus_queue_low",
    help: "Number of messages queued on the low priority event bus",
    registers: [registry],
  });
  const dlq = new Gauge({
    name: "eventbus_dlq_size",
    help: "Number of events currently stored in the event bus DLQ",
    registers: [registry],
  });

  const metrics = { high, medium, low, dlq } satisfies EventBusMetrics;
  eventBusMetricsByRegistry.set(registry, metrics);
  return metrics;
}

function normalizeQueueName(name: string): "high" | "medium" | "low" | null {
  if (!name) return null;
  const value = String(name).toLowerCase();
  if (value === "high") return "high";
  if (value === "med" || value === "medium") return "medium";
  if (value === "low") return "low";
  return null;
}

function deriveSummary(stats: { queues?: Array<{ name: string; size?: number }>; dlq?: unknown[] }) {
  const base = { high: 0, medium: 0, low: 0 } satisfies Record<"high" | "medium" | "low", number>;
  for (const queue of stats.queues ?? []) {
    const key = normalizeQueueName(queue.name);
    if (!key) continue;
    const size = typeof queue.size === "number" ? queue.size : base[key];
    base[key] = size;
  }
  const dlqSize = Array.isArray(stats.dlq) ? stats.dlq.length : 0;
  return { ...base, dlq: dlqSize };
}

async function observeEventBus(registry: Registry): Promise<void> {
  const metrics = ensureEventBusMetrics(registry);

  try {
    const stats = await bus.stats();
    const summary = stats.summary ?? deriveSummary(stats);
    metrics.high.set(summary.high ?? 0);
    metrics.medium.set(summary.medium ?? 0);
    metrics.low.set(summary.low ?? 0);
    metrics.dlq.set(summary.dlq ?? 0);
  } catch {
    metrics.high.set(0);
    metrics.medium.set(0);
    metrics.low.set(0);
    metrics.dlq.set(0);
  }
}

function resolveRouteLabel(req: Request): string {
  if (req.route?.path) {
    return req.route.path;
  }
  if (typeof req.path === "string" && req.path.length > 0) {
    return req.path;
  }
  if (typeof req.originalUrl === "string" && req.originalUrl.length > 0) {
    const [path] = req.originalUrl.split("?");
    return path || "unknown";
  }
  return "unknown";
}

export function createTimingMiddleware(options: { registry?: Registry } = {}): RequestHandler {
  const registry = options.registry ?? defaultRegistry;
  const histogram = ensureHttpHistogram(registry);

  return (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const seconds = Number(end - start) / 1e9;
      histogram.labels(req.method, resolveRouteLabel(req), String(res.statusCode)).observe(seconds);
    });
    next();
  };
}

export function createMetricsHandler(options: { registry?: Registry } = {}): RequestHandler {
  const registry = options.registry ?? defaultRegistry;

  return async (_req, res: Response) => {
    await observeEventBus(registry);
    res.set("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  };
}

export function createEventBusMetricsCollector(registry?: Registry): () => Promise<void> {
  const target = registry ?? defaultRegistry;
  ensureEventBusMetrics(target);
  return () => observeEventBus(target);
}

export const timingMiddleware = createTimingMiddleware();
export const metricsHandler = createMetricsHandler();
