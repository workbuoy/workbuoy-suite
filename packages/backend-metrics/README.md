# @workbuoy/backend-metrics

Lightweight Prometheus helpers for Workbuoy backend services.

## Features

- Shared `prom-client` registry (opt-in default metrics).
- Express middleware that records request counts and latency histograms.
- `/metrics` router that renders Prometheus exposition format.
- Helpers for creating custom `Counter` and `Histogram` metrics bound to the shared registry.

## Usage

```ts
import express from "express";
import {
  withMetrics,
  metricsRouter,
  createCounter,
  createHistogram,
} from "@workbuoy/backend-metrics";

const app = express();

withMetrics(app, {
  enableDefaultMetrics: true,
});

const featureUsageTotal = createCounter({
  name: "feature_usage_total",
  help: "Number of feature usage events observed",
  labelNames: ["feature", "action"],
});

const proposalLatencySeconds = createHistogram({
  name: "proposal_latency_seconds",
  help: "Latency for proposal lifecycle",
  buckets: [0.1, 0.5, 1, 2, 5],
});

featureUsageTotal.inc({ feature: "insights", action: "viewed" });
proposalLatencySeconds.observe(0.42);

app.use("/metrics", metricsRouter);
```

Call `withMetrics` before other middleware so the instrumentation observes all requests. Pass a custom `registry` if you need to share metrics between packages.

### Options

- `enableDefaultMetrics` (default: `true`) — collect Prometheus default metrics for the chosen registry.
- `defaultMetrics` — forwarded to `prom-client.collectDefaultMetrics` for advanced tuning (e.g. `prefix`).
- `registry` — share an existing `prom-client.Registry` instance across packages.

### Testing

```
npm test -w @workbuoy/backend-metrics
```

### Environment toggles

`apps/backend` wires this package behind `METRICS_ENABLED=true` and exposes the router at `METRICS_ROUTE` (defaults to `/metrics`).
See `apps/backend/src/observability/metricsBridge.ts` for an example of connecting domain events to exported helpers.
