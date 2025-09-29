import type { Express, Request, Response } from "express";
import { Counter, Histogram } from "prom-client";
import { getRegistry } from "./registry.js";
import { getBuckets, getMetricsPrefix, isMetricsEnabled } from "../observability/metricsConfig.js";

const SKIP_OPTIONAL = process.env.WB_SKIP_OPTIONAL_ROUTES === "1";

type Middleware = (...args: any[]) => any;
const asMw = (m: any): Middleware | undefined =>
  typeof m === "function"
    ? (m as Middleware)
    : typeof m?.default === "function"
      ? (m.default as Middleware)
      : typeof m?.router === "function"
        ? (m.router as Middleware)
        : undefined;

let fallbackMounted = false;

export async function mountMetrics(app: Express): Promise<boolean> {
  if (!isMetricsEnabled()) {
    mountFallback(app);
    return false;
  }

  if (SKIP_OPTIONAL) {
    console.log("[metrics] skipping optional metrics (WB_SKIP_OPTIONAL_ROUTES=1)");
    mountFallback(app);
    return false;
  }

  try {
    const mod = await import("@workbuoy/backend-metrics/dist/index.js");
    const mw = asMw(mod);
    if (!mw) {
      console.warn("[metrics] export not callable, mounting fallback");
      mountFallback(app);
      return false;
    }
    app.use(mw);
    console.log("[metrics] mounted optional metrics package");
    return true;
  } catch (err: any) {
    console.warn("[metrics] optional package not available:", err?.message ?? err);
    mountFallback(app);
    return false;
  }
}

function mountFallback(app: Express) {
  if (fallbackMounted) {
    return;
  }
  fallbackMounted = true;
  app.get("/metrics", (_req: Request, res: Response) => {
    res.type("text/plain").status(200).send("# workbuoy_metrics{noop=\"true\"} 1\n");
  });
  console.log("[metrics] mounted fallback /metrics");
}

function buildCounter(name: string, help: string, labelNames: readonly string[] = []) {
  const metricName = `${getMetricsPrefix()}${name}`;

  if (!isMetricsEnabled()) {
    return new Counter({ name: metricName, help, labelNames: [...labelNames], registers: [] });
  }

  const registry = getRegistry();
  const existing = safeGetMetric(registry, metricName);
  if (isCounterMetric(existing)) {
    return existing;
  }

  return new Counter({ name: metricName, help, labelNames: [...labelNames], registers: [registry] });
}

function buildHistogram(
  name: string,
  help: string,
  labelNames: readonly string[] = [],
  buckets?: number[],
) {
  const metricName = `${getMetricsPrefix()}${name}`;
  const overrideBuckets = getBuckets();
  const effectiveBuckets = overrideBuckets.length > 0 ? overrideBuckets : buckets;

  if (!isMetricsEnabled()) {
    return new Histogram({
      name: metricName,
      help,
      labelNames: [...labelNames],
      buckets: effectiveBuckets,
      registers: [],
    });
  }

  const registry = getRegistry();
  const existing = safeGetMetric(registry, metricName);
  if (isHistogramMetric(existing)) {
    return existing;
  }

  return new Histogram({
    name: metricName,
    help,
    labelNames: [...labelNames],
    buckets: effectiveBuckets,
    registers: [registry],
  });
}

function safeGetMetric(registry: ReturnType<typeof getRegistry>, metricName: string) {
  try {
    return registry.getSingleMetric(metricName) ?? undefined;
  } catch {
    return undefined;
  }
}

function isCounterMetric(metric: unknown): metric is Counter<string> {
  return metric instanceof Counter;
}

function isHistogramMetric(metric: unknown): metric is Histogram<string> {
  return metric instanceof Histogram;
}

export const crm_api_latency_ms = buildHistogram(
  "crm_api_latency_ms",
  "Latency for CRM API endpoints (ms)",
  ["method", "route", "status"],
  [10, 25, 50, 100, 200, 500, 1000, 2000],
);

export const audit_events_total = buildCounter("audit_events_total", "Audit events");

export const crm_webhook_success_total = buildCounter(
  "crm_webhook_success_total",
  "Successful CRM webhook deliveries",
);

export const crm_webhook_error_total = buildCounter(
  "crm_webhook_error_total",
  "Failed CRM webhook deliveries",
);

export const wb_import_total = buildCounter(
  "wb_import_total",
  "Number of records imported via CRM bulk import",
  ["entity"],
);

export const wb_import_fail_total = buildCounter(
  "wb_import_fail_total",
  "Number of CRM import failures",
  ["entity"],
);

export const wb_export_total = buildCounter(
  "wb_export_total",
  "Number of CRM export operations executed",
  ["entity"],
);

export const crm_pipeline_transitions_total = buildCounter(
  "crm_pipeline_transitions_total",
  "Pipeline stage transitions recorded",
);

export const rbac_denied_total = buildCounter(
  "rbac_denied_total",
  "Denied RBAC checks",
  ["resource", "action"],
);

export const rbac_policy_change_total = buildCounter(
  "rbac_policy_change_total",
  "Policy change operations executed via admin routes",
);

export const feature_usage_total = buildCounter(
  "feature_usage_total",
  "Recorded feature usage events",
  ["feature", "action"],
);

export {
  wb_connector_ingest_total,
  wb_connector_errors_total,
  wb_connector_retries_total,
} from "../connectors/metrics.js";
