# WorkBuoy Suite – Release Notes (PR9)

## Highlights
- Backend now exposes `/api/health` and `/api/version` endpoints backed by optional route guards, making it easy to trim the API surface with `WB_SKIP_OPTIONAL_ROUTES=1` during local runs.
- Database bootstrap is steadier thanks to updated Prisma seeds and new smoke tests validating health, metrics, and CRM routes in CI.
- Shared UI library ships new `FlipCard` and `ProactivitySwitch` components used across proactive workflows.

## How to upgrade
- Install dependencies from the repo root: `npm ci`.
- Prepare persistence: `npm run db:prepare -w @workbuoy/backend` followed by `npm run db:seed -w @workbuoy/backend` if you need demo data.
- Optional routes can be disabled during local development with `WB_SKIP_OPTIONAL_ROUTES=1 node --import tsx apps/backend/src/index.ts`.
- Run smoke tests before cutting a tag: `npm run -w @workbuoy/backend test:smoke`.

## Workspace docs
- [apps/backend README](apps/backend/README.md)
- [@workbuoy/ui README](packages/ui/README.md)
- [Frontend README](apps/frontend/README_frontend.md)
