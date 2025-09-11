# MVP Add-ons — Prod-hardening & Why-sources

## Innhold
- Rate limiting middleware for write-ruter
- AppError-taxonomi + error-mapper
- Build-info endpoint `/buildz`
- DB feature flag helper + wiring-guide
- Why sources (policy rule refs) + patch-guide
- Grafana dashboard JSON (RPS, p95, 4xx/5xx, DLQ)
- Tester: AppError-mapper og build-info

## Bruk
1) **Wire limiter** på POST/PATCH/DELETE:
```ts
import { writeRateLimiter } from "./core/http/middleware/rateLimit";
router.post("/api/tasks", writeRateLimiter(), handler);
```

2) **AppError** i kontrollerne:
```ts
import { AppError } from "./core/errors/AppError";
if (!valid) throw new AppError("E_VALIDATION","invalid payload",400,{ field:"name" });
```
Legg `errorMapper` sist i middleware-kjeden:
```ts
import { errorMapper } from "./core/http/middleware/errorMapper";
app.use(errorMapper);
```

3) **/buildz**:
```ts
import buildRoutes from "./core/http/routes/build";
app.use(buildRoutes);
```

4) **DB flag wiring**: se `PATCHES/WIRE_DB_FLAG.md`.

5) **Why-sources**: se `PATCHES/WIRE_WHY_SOURCES.md`.

## Miljøvariabler
```
RATE_WINDOW_MS=60000
RATE_MAX=100
DB_ENABLED=true
BUILD_VERSION=v2.1.0
GIT_SHA=<sha>
BUILT_AT=2025-09-11T00:00:00Z
```

## Tester
```
npm test -- --runTestsByPath tests/errors.mapper.test.ts tests/build.info.test.ts
```
