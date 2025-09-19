# META Route Runbook

This runbook explains how to operate the WorkBuoy META endpoints in production. Use it alongside the Grafana dashboard at `grafana/dashboards/meta.json` and the Prometheus scrape exposed via `/api/meta/metrics`.

## Readiness checks & probes

| Probe name | What it validates | Common failure modes | First actions |
|------------|------------------|-----------------------|---------------|
| `db`       | Primary application database connectivity and latency. | Credentials expired, failover in progress, network partitions. | Check database availability, rotate credentials if needed, re-run migrations if failover happened. |
| `queue`    | Background job broker health (e.g., Redis/Cloud queue). | Broker unavailable, TLS misconfiguration, backlog saturation. | Inspect queue dashboard, drain or scale workers, verify TLS certificates. |
| `outbound` | External integrations / webhooks health. | Third-party API outage, DNS issues, firewall blocks. | Review third-party status page, confirm outbound proxy, retry later. |

### Readiness states
- `ready`: All probes returned `ok`. Service can accept traffic.
- `degraded`: At least one probe is `warn`. Investigate but keep service online; alert SRE if condition persists >10 minutes.
- `not_ready`: Any probe is `fail`. Trigger incident response, stop new deployments, and escalate to the owning team.

Use `scripts/smoke-meta.sh` to verify that the public probes (/health, /version) are responding before and after mitigation steps.

## Observability

Prometheus metrics exposed:
- `meta_request_latency_ms{route,method,status}` – Histogram of META response times.
- `meta_readiness_checks_total{check,status}` – Counter of probe outcomes.
- `policy_denies_total{feature,reason}` – Counter of policy deny events.
- `audit_failures_total` – Counter of audit failure events included in summaries.

Grafana dashboard panels (see `grafana/dashboards/meta.json`):
1. **Health status** – Shows current `/health` uptime and status flag. Use for rapid smoke verification.
2. **Readiness breakdown** – Table of readiness checks using `meta_readiness_checks_total` split by status. Investigate spikes in `warn`/`fail`.
3. **Policy denies** – Bar chart grouped by `reason` from `policy_denies_total`. High counts indicate tightened policy or unexpected user behaviour.
4. **Audit failures** – Time series of `audit_failures_total` increments. Investigate when failures jump compared to baseline.
5. **META request latency P95** – `histogram_quantile(0.95, sum(rate(meta_request_latency_ms_bucket[5m])) by (le))`. Degradation indicates downstream or authentication slowness.

## Playbooks

- **Database probe fails** (`db`):
  1. Confirm database availability (console or `psql`).
  2. If credentials rotated, update secret and restart API.
  3. If failover occurred, ensure replicas rejoin and DNS caches clear.
  4. Keep `not_ready` until transactions succeed.

- **Queue probe warns/fails** (`queue`):
  1. Check worker backlog.
  2. Scale worker pool or purge poison messages.
  3. Validate broker TLS/ACL changes; restart broker clients if needed.

- **Outbound probe warns** (`outbound`):
  1. Review third-party status pages.
  2. Confirm network egress routes and DNS resolution.
  3. Toggle feature flags to reduce outbound load if outage persists.

- **Policy denies spike**:
  1. Inspect recent policy changes (profiles, autonomy level).
  2. Review audit logs for new intents causing denials.
  3. Coordinate with policy owners before altering enforcement levels.

- **Audit failures increase**:
  1. Drill into `/api/meta/audit-stats` to identify `top_errors`.
  2. Compare against deployment timeline.
  3. Raise incident if failures exceed agreed SLO (default <1% of actions per hour).

## Escalation & SLOs
- Target META endpoints uptime ≥ 99.9%.
- Page on-call if `/readiness` remains `not_ready` for >5 minutes or if audit failure rate crosses 5% of actions.
- After mitigation, verify metrics return to baseline and annotate incident timeline with Grafana dashboard links.

## Security notes
- Only tokens containing `meta:read` may call protected routes. Requests without the scope respond with HTTP 403.
- Public endpoints (`/health`, `/version`) are rate-limited to 60 requests/min/IP; repeated 429s usually indicate misconfigured monitors.
