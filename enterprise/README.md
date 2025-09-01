# PR 3 – Secure: DSR APIer + datakart + SIEM-forwarding

This patch adds:
- SQLite migration for `dsr_requests`
- `/api/secure/dsr/*` routes (access, erasure, rectification, consent)
- WORM audit + SIEM forwarding (Splunk/Datadog/generic)
- Data map & retention docs
- Retention purge cron
- Jest unit tests & Playwright E2E for access/erasure

## Install & run (standalone demo)

```bash
npm i
npm run start:examples
# in another shell
curl -X POST localhost:3333/api/secure/dsr/access -H 'content-type: application/json' -d '{"user_email":"alice@example.com"}'
```

## Mounting in your app

```js
// server.js
const dsrRouter = require('./api/secure/dsr');
app.use('/api/secure/dsr', dsrRouter);

// Provide your GDPR exporter
app.locals.gdprExport = async (email) => { /* ... */ };
```

## SIEM environment

- SIEM_PROVIDER = splunk | datadog | generic
- SIEM_ENDPOINT = HTTP endpoint (e.g., Splunk HEC / Datadog intake)
- SIEM_TOKEN = token or API key
- SIEM_SOURCE (optional), SIEM_TAGS (optional)

## Retention cron

- Edit `config/retention.json`
- Run `npm run retention:purge` (suitable for a daily cron)

## Tests

- Unit: `npm test`
- E2E: `npm run test:e2e`

> Note: Router gracefully no-ops when your app doesn't have `users` table; it still logs and records evidence.


## PostgreSQL Setup
1. `docker compose up -d postgres`
2. `export DATABASE_URL=postgres://workbuoy:workbuoy@localhost:5432/workbuoy`
3. `node scripts/db/migrate-from-sqlite-to-postgres.js`


## New Modules

- Data Quality (hygiene, validation, writeback, monitor, workflows)
- Integrations Robustness (circuit breaker, connector manager, data sync, monitoring)
- Performance Scaling (high-performance scoring engine, concurrency controller, DB optimizations)

### Endpoints
- `POST /api/data-quality/validate`
- `GET /api/integrations/health`

### Scripts
- `node scripts/perf/bench_scoring.js`
- `node scripts/cron/dq-learn-outcomes.js`

### Feature Flags (default: OFF)
- `WB_FEATURE_DQ_WRITEBACK_AUTOPLY`
- `WB_FEATURE_INTEGRATIONS_BREAKER`
- `WB_FEATURE_SCORING_AUTOTUNE`


## CXM v2.3 — All SaaS Connectors (Scaffold)
- Se `CONNECTORS.md` for aktivering og normalisert signal-ingest.
- Endepunkt: `POST /api/connectors/sync` (manuell sync), `GET|POST /api/connectors/[name]/webhook`.
