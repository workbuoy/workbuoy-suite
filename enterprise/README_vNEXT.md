# WorkBuoy vNEXT (Enterprise + SaaS Ready)

This is the consolidated, fixed repository built from:
- WorkBuoy_CXM_v2_3_FINAL_ENTERPRISE_103
- WorkBuoy_saas_v1
- WorkBuoy_CXM_v2_3_SaaS_AI_PR
- workbuoy_repo_patched_final

## Highlights
- Real rate limiter (per-tenant/IP/user) with Redis optional backend.
- Postgres-first: connector_state, worm_audit, idempotency_keys migrations.
- WORM audit with hash chain + SIEM HMAC fanout.
- Scheduler rewritten, respects breaker + concurrency; emits metrics.
- Stripe webhook with signature verification + idempotency.
- Helm chart completed: ExternalSecret, HPA, PDB, NetworkPolicy, ServiceMonitor.
- Dockerfile hardened (non-root, healthcheck).

## Running locally
1. `cp .env.example .env` and set DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
2. `npm ci && npm run dev`

## Migrations
Apply `db/migrations/pg_*.sql` to Postgres.
