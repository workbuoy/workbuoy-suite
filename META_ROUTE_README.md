# META Route Quickstart

The META surface provides operational telemetry for WorkBuoy services. All routes live under `/api/meta`. Health and version are public but throttled; every other endpoint requires a bearer token that grants the `meta:read` scope.

## Endpoint catalog

### `GET /api/meta/health`
- **Purpose:** Liveness probe for load balancers and uptime monitors.
- **Auth:** Public (rate-limited to 60 req/min per IP).
- **Example:**
  ```bash
  curl -s http://localhost:8080/api/meta/health | jq
  ```
- **Sample response:**
  ```json
  {
    "status": "ok",
    "uptime_s": 1234.56,
    "git_sha": "abcdef1",
    "started_at": "2024-05-01T12:00:00.000Z"
  }
  ```

### `GET /api/meta/version`
- **Purpose:** Build + deployment metadata for support teams.
- **Auth:** Public (rate-limited).
- **Sample response:**
  ```json
  {
    "semver": "2.4.4",
    "git_sha": "abcdef1",
    "built_at": "2024-04-29T18:04:00.000Z"
  }
  ```

### `GET /api/meta/readiness`
- **Purpose:** Aggregated probe runner for dependencies (DB, queue, outbound integrations, etc.).
- **Auth:** Requires `meta:read`.
- **Query:** `?include=db,queue` to filter checks.
- **Sample response:**
  ```json
  {
    "status": "degraded",
    "checks": [
      { "name": "db", "status": "ok", "latency_ms": 12 },
      { "name": "queue", "status": "warn", "latency_ms": 85, "reason": "lag" }
    ]
  }
  ```

### `GET /api/meta/capabilities`
- **Purpose:** Snapshot of enabled modes, connectors, and feature flags resolved from config/env.
- **Auth:** Requires `meta:read`.
- **Sample response:**
  ```json
  {
    "modes": { "core": true, "flex": false, "secure": true },
    "connectors": [
      { "name": "hubspot", "enabled": true },
      { "name": "salesforce", "enabled": false }
    ],
    "feature_flags": { "alpha": true, "beta": false }
  }
  ```

### `GET /api/meta/policy`
- **Purpose:** Current policy autonomy level plus rolling deny counters.
- **Auth:** Requires `meta:read`.
- **Sample response:**
  ```json
  {
    "autonomy_level": 1,
    "policy_profile": "default",
    "deny_counters": { "last_1h": 3, "last_24h": 12 }
  }
  ```

### `GET /api/meta/audit-stats`
- **Purpose:** Hourly audit summarisation (intents, actions, failures, and top failure codes).
- **Auth:** Requires `meta:read`.
- **Query:** Optional `from`/`to` ISO-8601 timestamps.
- **Sample response:**
  ```json
  {
    "window": {
      "from": "2024-05-01T11:00:00.000Z",
      "to": "2024-05-01T12:00:00.000Z"
    },
    "totals": { "intents": 120, "actions": 118, "failures": 4 },
    "top_errors": [
      { "code": "E_TIMEOUT", "count": 2 },
      { "code": "E_AUTH", "count": 1 }
    ]
  }
  ```

### `GET /api/meta/metrics`
- **Purpose:** Prometheus exposition of META metrics (`meta_request_latency_ms`, `meta_readiness_checks_total`, `policy_denies_total`, `audit_failures_total`, etc.).
- **Auth:** Requires `meta:read`.
- **Responses:**
  - `text/plain` metrics body.
  - JSON `{ "location": "/metrics" }` when another exporter hosts the scrape target.

## Readiness states
- `ready` – all probes return `ok`.
- `degraded` – at least one probe reports `warn`; service should stay online but needs attention.
- `not_ready` – one or more probes failed; orchestrators should stop routing new traffic.

## Running locally
1. Start dependencies via `docker-compose -f docker-compose.meta.yml up -d`.
2. Seed env vars (see compose file for examples of `MODE_CORE`, feature flags, etc.).
3. Hit the endpoints using the curls above. Use `scripts/smoke-meta.sh` for a quick probe check (set `META_TOKEN` to include `/readiness`).

## Auth & rate limiting
- Attach a bearer token whose claims include `meta:read` for protected routes. For local testing you can stub `req.user` via middleware.
- Public endpoints are capped at 60 requests per minute per IP. Excess traffic receives HTTP 429.
