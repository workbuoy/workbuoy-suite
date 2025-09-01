# Meta Experiments Module (WorkBuoy)

This patch adds a minimal experiments engine with policy-gated autonomy, Prometheus-backed SLO checks, auto-rollback, and audit WORM logging.

## What’s included
- **SQLite migrations**: `experiments`, `experiment_assignments`, `experiment_events` (db/migrations/0015_*.sql)
- **API routes** (Next.js):
  - `POST /api/meta/experiments/start`
  - `POST /api/meta/experiments/stop`
  - `GET /api/meta/experiments/:id/metrics`
- **Secure policy gate**: `lib/secure-policy.js` binds autonomy to `secure.policy.json`
- **Auto-rollback**: `lib/meta/metrics.js` (Prometheus) + `lib/meta/experiments.js` calling existing `lib/meta/rollback.js`
- **Audit**: hooks into `lib/audit.js#auditLog`
- **Tests**: Jest unit + Playwright E2E
- **Example policy**: `secure.policy.json.example`

## Quick start
1. Copy `secure.policy.json.example` to `secure.policy.json` and set:
   ```json
   { "allow_autonomy": true }
   ```
2. Run migrations:
   ```bash
   node scripts/migrate.js
   ```
3. Start dev server and test:
   ```bash
   npm run dev
   # In another terminal:
   curl -X POST http://localhost:3000/api/meta/experiments/start \\
     -H 'content-type: application/json' \\
     -d '{ "name":"exp-1","goal":"reduce latency","sla_target": { "p95_latency_ms": 800, "error_rate_threshold": 0.02 } }'
   ```

### Prometheus SLOs (optional)
Pass a `prometheus` object when starting/stopping to enable SLA checks and auto-rollback:
```json
{
  "baseUrl": "http://prometheus:9090",
  "intervalMs": 30000,
  "queryLatency": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{experiment=\"${experimentId}\"}[${window}])) by (le)) * 1000",
  "queryErrorRate": "sum(rate(http_requests_total{experiment=\"${experimentId}\",status=~\"5..\"}[${window}])) / clamp_min(sum(rate(http_requests_total{experiment=\"${experimentId}\"}[${window}])), 1e-9)"
}
```

### Notes
- The WORM audit table already exists in this repo; `auditLog` is used for every action.
- `allow_autonomy=false` **blocks** start/stop and background rollback watchers.
- `promoteExperiment` is a no-op placeholder — wire it to your feature flag promotion if needed.
