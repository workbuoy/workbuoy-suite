# Workbuoy Suite

[![CI](https://github.com/workbuoy/workbuoy-suite/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/workbuoy/workbuoy-suite/actions/workflows/ci.yml)

Monorepo for Workbuoy webapp/suite.

## Requirements
- Node.js >= 20
- npm >= 10
- Docker + Docker Compose

## Local development (one command)
```bash
cp .env.example .env
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Postgres: localhost:5432

## Workspace scripts
```bash
npm run dev          # docker compose up --build
npm run dev:down     # stop stack and remove volumes
npm run lint
npm run typecheck
npm test
npm run build
npm run meta -- --suggest
```

## Backend & database
- Prisma migrations + seed:
  - `npm run -w @workbuoy/backend db:prepare`
  - `npm run -w @workbuoy/backend db:seed`
- Health endpoint: `GET /api/meta/health`

## Frontend integration
Frontend dev server has proxy for `/api` and `/core` to backend target from `VITE_API_PROXY_TARGET` (default `http://localhost:3000`).

## CI baseline
CI workflows live under `.github/workflows` and run lint/typecheck/tests (plus additional repo policies and OpenAPI checks).

## META / self-developing mode
Use the safe CLI:
```bash
npm run meta
npm run meta -- --suggest
```
Outputs are written to `meta/reports/` and require manual review before any code changes.

See also:
- [QUICKSTART.md](QUICKSTART.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [REPO_MAP.md](REPO_MAP.md)
- [RELEASE_DEVOPS.md](RELEASE_DEVOPS.md)
- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- [META_RUNBOOK.md](META_RUNBOOK.md)
