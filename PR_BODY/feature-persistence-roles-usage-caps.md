# DB persistence for roles & usage + caps integration (proactivity-aware, gap fill)

Branch: `feature/persistence-roles-usage-caps`

## What
End-to-end wiring after Proactivity Core:
- Roles, Features, Org Overrides, User Bindings, and Usage Signals with **DB-first** repos (Prisma if available) and **file fallback** (FF_PERSISTENCE=false).
- Proactivity effective mode = `min(requested, role/feature cap, subscription cap, tenant policy cap)` with **explainability basis**.
- Admin endpoints for **roles import/overrides** and **subscription plan/flags**.
- **Active features** API ranking by caps + usage.
- **OpenAPI** append, **docs**, and **tests** (DB tests skipped unless FF_PERSISTENCE=true).

## Already present (kept, not duplicated)
- Event bus v2 with stats + DLQ metrics and `/metrics` gauges
- Policy v2 guard on write routes
- Audit chain + `/api/audit(/verify)`
- `/status`, `/_debug/bus`
- Frontend `@/api` bridge
- `selectRepo` file persistence

## Added / Modified (this PR)
### Backend (additive V2, no overwrite of your files)
- `backend/routes/admin.roles.v2.ts` – POST import, PUT override, GET inspect (policyGuardWrite('admin')).
- `backend/routes/admin.subscription.v2.ts` – GET/PUT plan, flags.
- `backend/routes/features.v2.ts` – `GET /api/features/active` (ranking).
- `backend/routes/usage.v2.ts` – usage events + aggregates (DB if enabled, else 204 on empty).
- `src/roles/db/RoleRepo.v2.ts`, `FeatureRepo.v2.ts`, `OverrideRepo.v2.ts`, `UserRoleRepo.v2.ts` – Prisma if present, else file.
- `src/telemetry/usageSignals.db.v2.ts` – DB usage record/aggregate + fallback.
- `src/core/proactivity/context.roleCaps.v2.ts` – computeEffectiveModeV2 with basis entries.
- `src/features/activation/featureActivation.v2.ts` – ranking implementation.
- `src/routes/_autoload.persistence.v2.ts` – safe mounts guarded by `FF_PERSISTENCE` (no server conflicts).
- `scripts/seed-roles-from-json-v2.ts` – idempotent import from `roles/roles.json`. 

### Schema & Migrations (conflict-free)
- `prisma/patches/20250920_roles_usage_persistence.sql` – additive SQL (run via psql) – **does not edit schema.prisma**.

### OpenAPI & Docs (append-only)
- `openapi/patches/core.persistence.yaml` – new paths/schemas for roles/admin/usage/features.
- `docs/append/roles.md`, `docs/append/usage.md`, `docs/append/proactivity.md`, `docs/append/api.md` – append sections; no overwrite.

### Tests (DB-gated)
- `tests/persistence-smoke/roles.db.test.ts` (skip without FF_PERSISTENCE)
- `tests/persistence-smoke/usage.db.test.ts` (skip without FF_PERSISTENCE)
- `tests/persistence-smoke/features.active.api.test.ts` (skip without FF_PERSISTENCE)

## How to run (local)
```bash
# Fallback (file): works out of the box
FF_PERSISTENCE=false npm test -- --coverage

# DB path (requires deps + Postgres + prisma generate)
npm i --prefix backend @prisma/client prisma
npx prisma generate || true
export DATABASE_URL=postgres://user:pass@localhost:5432/workbuoy
psql "$DATABASE_URL" -f prisma/patches/20250920_roles_usage_persistence.sql

# seed (optional)
NODE_PATH=backend/node_modules node -r ts-node/register scripts/seed-roles-from-json-v2.ts

FF_PERSISTENCE=true npm test -- --coverage
```

## Server wiring
V2 routes are mounted by importing `./src/routes/_autoload.persistence.v2` in `src/server.ts` (single import, no conflicts). If not present, they are inert.

## Acceptance
- In-memory fallback remains green.
- With DB and FF_PERSISTENCE=true:
  - Roles import OK, overrides OK
  - Active features returns ranked list
  - Usage events stored and aggregates change ranking
  - Proactivity effective mode shows correct `basis[]`

## TODO
- Promote SQL patch into Prisma migrations once schema ownership is finalized
- Admin UI for overrides/subscription
- Telemetry gauges for usage rates
