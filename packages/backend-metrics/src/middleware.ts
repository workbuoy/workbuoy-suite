import type { Application, NextFunction, Request, Response } from "express";
import { Counter, Histogram, type Registry } from "prom-client";
import { ensureDefaultMetrics, getRegistry, type CollectDefaultsOptions } from "./registry.js";

const requestLabelNames = ["method", "path", "status_code"] as const;
type HttpLabel = (typeof requestLabelNames)[number];

interface RegistryMetrics {
  counter: Counter<HttpLabel>;
  histogram: Histogram<HttpLabel>;
}

const metricsByRegistry = new WeakMap<Registry, RegistryMetrics>();

function resolveMetrics(registry: Registry): RegistryMetrics {
  const existing = metricsByRegistry.get(registry);
  if (existing) {
    return existing;
  }

  const counter = new Counter<HttpLabel>({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: requestLabelNames,
    registers: [registry],
  });

  const histogram = new Histogram<HttpLabel>({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: requestLabelNames,
    registers: [registry],
    buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  const metrics = { counter, histogram } satisfies RegistryMetrics;
  metricsByRegistry.set(registry, metrics);
  return metrics;
}

function resolvePathLabel(req: Request): string {
  if (req.route?.path) {
    return req.baseUrl ? `${req.baseUrl}${req.route.path}` : req.route.path;
  }

  if (typeof req.baseUrl === "string" && req.baseUrl.length > 0) {
    return req.baseUrl;
  }

  if (typeof req.path === "string" && req.path.length > 0) {
    return req.path;
  }

  if (typeof req.originalUrl === "string" && req.originalUrl.length > 0) {
    const [path] = req.originalUrl.split("?");
    return path || "/unknown";
  }

  return "/unknown";
}

export interface WithMetricsOptions {
  registry?: Registry;
  enableDefaultMetrics?: boolean;
  defaultMetrics?: CollectDefaultsOptions;
}

export interface WithMetricsResult {
  registry: Registry;
}

export function createRequestMetricsMiddleware(registry: Registry): (req: Request, res: Response, next: NextFunction) => void {
  const { counter, histogram } = resolveMetrics(registry);

  return (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const durationSeconds = Number(end - start) / 1e9;
      const path = resolvePathLabel(req);
      const labels = {
        method: req.method,
        path,
        status_code: String(res.statusCode),
      } satisfies Record<HttpLabel, string>;

      counter.inc(labels);
      histogram.observe(labels, durationSeconds);
    });

    next();
  };
}

export function withMetrics(app: Application, options: WithMetricsOptions = {}): WithMetricsResult {
  const registry = options.registry ?? getRegistry();
  const enableDefaults = options.enableDefaultMetrics ?? true;

  if (enableDefaults) {
    ensureDefaultMetrics(registry, options.defaultMetrics);
  }

  const middleware = createRequestMetricsMiddleware(registry);
  app.use(middleware);

  return { registry } satisfies WithMetricsResult;
}
