# WorkBuoy CRM MVP – Release Notes (v0.1.0)

## Highlights
- **Policy v2 guard** now enforces `x-autonomy-level >= 2` on all write routes with explicit 400 errors for missing or invalid headers.
- **Request context + correlation IDs** wired globally so every request emits structured logs with masked fields.
- **Persistence** for CRM contacts, tasks, logs and deals now uses the shared `selectRepo<T>` layer (default `PERSIST_MODE=file`) so data survives restarts.
- **Operability endpoints** exposed at `/status`, `/metrics`, and `/_debug/bus` together with append-only audit trail (`/api/audit`, `/api/audit/verify`).
- **Frontend bridge** routes all fetches through `@/api` with automatic `x-autonomy-level`/`x-role` headers; CRM panel import is stable for Navi.

## Upgrade notes
1. Install dependencies: `npm install --prefix backend && npm install --prefix frontend`.
2. Launch the API via `docker compose up app` (or `NODE_PATH=backend/node_modules node -r ts-node/register src/bin/www.ts`).
3. Verify `/status` and `/metrics`, then seed demo data via the documented `curl` commands.

## Known considerations
- Metrics are served in Prometheus text format at `/metrics` and include queue gauges (`eventbus_queue_high|med|low`, `eventbus_dlq_size`).
- Audit entries persist to `data/audit_log.json`; avoid editing this file manually to preserve the hash chain.
