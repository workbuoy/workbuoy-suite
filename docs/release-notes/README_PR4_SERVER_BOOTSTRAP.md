# PR4 — Server bootstrap complete (export app, start in bin/www)

## What changed
- `apps/backend/src/server.ts` now **exports `app` only** (no `listen` here) and wires middleware in the correct order:
  1) `requestContext` → 2) `express.json()` → 3) (route-local) write rate-limit →
  4) feature routers (policy is applied inside routers on write paths) →
  5) Buoy routes → 6) `/healthz`, `/readyz`, `/buildz` → 7) `errorHandler` last.
- `src/bin/www.ts` is the **only** place starting the HTTP server.
- Dev-only: mounts `/api/_debug/dlq` when `NODE_ENV != 'production'`.

## Tests
- `tests/e2e/bootstrap.smoke.test.ts` checks healthz/readyz and basic route availability,
  including a write-policy denial path for `/api/tasks` at `x-autonomy-level: 1`.

## Follow-up
- If any feature router uses a different base path, adjust `app.use(...)` accordingly.
- Replace the placeholder `writeRateLimit` with `express-rate-limit` or your preferred limiter.

## Commit message
```
chore(server): export app; add bin/www; wire routes & health/ready/build; mount DLQ (dev); add e2e smoke
```
