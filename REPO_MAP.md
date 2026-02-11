# Repo Map

## Runtime-komponenter
- `apps/backend`: Express/TypeScript API, auth/middleware, observability, Prisma-migrasjoner.
- `apps/frontend`: Vite + React webapp.
- `packages/*`: delte biblioteker (`ui`, `backend-auth`, `backend-rbac`, `backend-metrics`, m.fl.).
- `db/`: SQL-migrasjoner og init-skript.
- `openapi/`: API-kontrakter/spec-filer.
- `docker-compose.yml`: lokal multi-service oppstart (db + backend + frontend).

## Entrypoints
- Backend: `apps/backend/src/index.ts`.
- Frontend: `apps/frontend` via `vite` (`npm run -w @workbuoy/frontend dev`).
- Compose: `docker compose up --build`.

## Build/tooling
- Package manager: npm workspaces.
- Typecheck: TypeScript (`npm run typecheck`).
- Test: Jest + Vitest.
- CI: GitHub Actions workflows under `.github/workflows`.

## Observerte broken points (før denne endringen)
1. Root manglet tydelig én-kommando dev-script.
2. `docker-compose.yml` pekte til gammel backend-entrypoint (`src/bin/www.ts`) som ikke matcher dagens struktur.
3. Frontend manglet eksplisitt Vite-proxy for `/api` mot backend i lokal dev.
4. Utydelig meta-workflow (selvutviklende modus) uten ett dedikert, sikkert CLI.
5. Spredt dokumentasjon for onboarding/release; manglet samlet release-checklist for repoet.

## Planlagte PR-trinn (6–12)
1. Repo map + baseline docs + beslutningslogg.
2. Dev bootstrap og docker-compose justeringer.
3. Env-standardisering + backend env-validering.
4. DB from-scratch migrasjon/seed hardening.
5. Backend kontrakt og feilhåndtering.
6. Frontend e2e happy path og API-integrasjon.
7. API/UI smoke + kontraktstester.
8. CI hardening (lint/typecheck/test/build minimum-gates).
9. Deploy path docs + container verifisering.
10. META CLI + sikkerhetsrunbook.
