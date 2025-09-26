# @workbuoy/backend-metrics

Lightweight Prometheus helpers for Workbuoy backend services.

## Features

- Shared `prom-client` registry (opt-in default metrics).
- Express middleware that records request counts and latency histograms.
- `/metrics` router that renders Prometheus exposition format.

## Usage

```ts
import express from "express";
import { withMetrics, metricsRouter } from "@workbuoy/backend-metrics";

const app = express();

withMetrics(app, {
  enableDefaultMetrics: true,
});

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
