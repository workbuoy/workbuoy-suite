# Wire observability & health

Edit `src/server.ts`:

```ts
import healthRoutes from "./core/http/routes/health";
import metricsRoutes from "./core/http/routes/metrics";
import { timingMiddleware } from "./core/observability/metrics";

app.use(timingMiddleware); // optional but recommended
app.use(healthRoutes);
app.use(metricsRoutes);
```

Verify:
```
curl -s localhost:3000/healthz
curl -s -o- -w "\n%{http_code}\n" localhost:3000/readyz
curl -s localhost:3000/metrics | head
```
