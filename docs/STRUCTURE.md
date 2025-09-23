# Monorepo structure

Workbuoy now uses an npm workspace monorepo layout. The top-level directories of
note are:

- `apps/backend/` – backend service code (moved from `backend/`).
- `apps/frontend/` – frontend application code (moved from `frontend/`).
- `packages/` – reserved for future shared packages.
- `scripts/` – shared utilities (imports updated to target `apps/backend`).
- `docs/` – repository documentation (this file).
- `tools/` – helper scripts and automation utilities.

## Workspace commands

Install dependencies across the repository with:

```bash
npm run bootstrap
```

Common backend commands run through the `@workbuoy/backend` workspace:

- Build: `npm run build -w @workbuoy/backend`
- Test: `npm run test -w @workbuoy/backend -- --runInBand --passWithNoTests`
- Type-check: `npm run typecheck -w @workbuoy/backend`
- Seed roles/features: `FF_PERSISTENCE=true DATABASE_URL=postgres://... npm run seed:roles -w @workbuoy/backend`

The root `npm run typecheck` script runs both the backend workspace type-check
and the shared meta `tsconfig.meta.json` pass.

## CI overview

Backend CI jobs run from the repository root using workspace-aware commands:

- **In-memory tests** (`backend-ci.yml`): installs with
  `npm install --workspaces --include-workspace-root` and executes
  `npm run test -w @workbuoy/backend`.
- **Persistence tests** (`backend-persistence.yml`): same install step, runs
  Prisma generate/migrate against `apps/backend/prisma/schema.prisma`, seeds via
  `npm run seed:roles -w @workbuoy/backend`, and executes the workspace Jest
  suite with persistence enabled.

Future waves will extend the pipeline to cover other workspaces. Frontend CI is
intentionally unchanged in this wave.
