import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

export async function metricsHandler(req: any, res: any) {
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
