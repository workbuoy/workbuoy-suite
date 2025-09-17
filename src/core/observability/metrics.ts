import client from "prom-client";
import { bus } from "../eventBusV2";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

const eventbusQueueHigh = new client.Gauge({
  name: "eventbus_queue_high",
  help: "Number of messages queued on the high priority event bus"
});
const eventbusQueueMed = new client.Gauge({
  name: "eventbus_queue_med",
  help: "Number of messages queued on the medium priority event bus"
});
const eventbusQueueLow = new client.Gauge({
  name: "eventbus_queue_low",
  help: "Number of messages queued on the low priority event bus"
});
const eventbusDlqSize = new client.Gauge({
  name: "eventbus_dlq_size",
  help: "Number of events currently stored in the event bus DLQ"
});

register.registerMetric(eventbusQueueHigh);
register.registerMetric(eventbusQueueMed);
register.registerMetric(eventbusQueueLow);
register.registerMetric(eventbusDlqSize);

function normalizeQueueName(name: string): 'high' | 'medium' | 'low' | null {
  if (!name) return null;
  const value = String(name).toLowerCase();
  if (value === 'high') return 'high';
  if (value === 'med' || value === 'medium') return 'medium';
  if (value === 'low') return 'low';
  return null;
}

function deriveSummary(stats: { queues?: Array<{ name: string; size?: number }>; dlq?: unknown[] }) {
  const base = { high: 0, medium: 0, low: 0 };
  for (const queue of stats.queues ?? []) {
    const key = normalizeQueueName(queue.name);
    if (!key) continue;
    base[key] = typeof queue.size === 'number' ? queue.size : base[key];
  }
  const dlqSize = Array.isArray(stats.dlq) ? stats.dlq.length : 0;
  return { ...base, dlq: dlqSize };
}

async function observeEventBus() {
  try {
    const stats = await bus.stats();
    const summary = stats.summary ?? deriveSummary(stats);
    eventbusQueueHigh.set(summary.high ?? 0);
    eventbusQueueMed.set(summary.medium ?? 0);
    eventbusQueueLow.set(summary.low ?? 0);
    eventbusDlqSize.set(summary.dlq ?? 0);
  } catch {
    eventbusQueueHigh.set(0);
    eventbusQueueMed.set(0);
    eventbusQueueLow.set(0);
    eventbusDlqSize.set(0);
  }
}

export async function metricsHandler(req: any, res: any) {
  await observeEventBus();
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

// Express middleware to time requests (optional)
export function timingMiddleware(req: any, res: any, next: any) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const seconds = Number(end - start) / 1e9;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path || "unknown", String(res.statusCode))
      .observe(seconds);
  });
  next();
}
