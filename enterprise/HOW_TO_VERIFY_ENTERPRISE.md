# How to Verify (5–15 min)

## Phase 1A — PG in prod
- Set `NODE_ENV=production` and `DATABASE_URL=...` and run API tests: `npm test` → all green.
- Run `node scripts/db/migrate-from-sqlite-to-postgres.js` → check counts match.
- Hit `/api/metrics` and confirm `wb_pg_query_duration_ms_sum` and `_count` exist.

## Phase 1B — KMS
- Set `KMS_PROVIDER=local-dev` and `KMS_KEY_ID=local/dev`.
- Create a new user row → value stored as JSON envelope (base64 fields).
- Run `npm run crypto:backfill`.
- Hit `/api/metrics` → `wb_kms_ops_total` present; trigger an error to see `wb_kms_errors_total`.

## Phase 2 — Compliance
- Fill templates in `/compliance` and update `SECURE_CONTROLS.md`. Ensure evidence links exist.

## Phase 3 — Resilience & SecOps
- Run `npm run bcdr:backup` then `npm run bcdr:restore:test`.
- Ensure `wb_backup_last_success_timestamp` exported in `/api/metrics` (set by restore script or service).
- Run auth E2E negative tests (bad state/nonce) → fail as expected; abuse metric increments.
