# Superdrop v2 — Persistens (Postgres/Prisma) + Observability

Denne droppen gir:
- **Persistens**: Prisma + Postgres schema for `contacts`, `tasks`, `log_entries`, `audit_chain`
- **Repos**: `contacts.repo.ts`, `tasks.repo.ts`, `log.repo.ts`
- **Observability**: Prometheus metrics (`/metrics`), request timing middleware, health (`/healthz`) og readiness (`/readyz`)
- **Guides**: `PATCHES/DB_SETUP.md`, `PATCHES/WIRE_OBSERVABILITY.md`
- **Tester**: `tests/health.ready.test.ts` (krever kun at rutene wires)

## Branch & PR
```
git checkout -b feat/superdrop-v2-persist-observability
# pakk ut i repo-roten
git add .
git commit -m "feat(superdrop-v2): Postgres/Prisma persistence + observability (metrics/health/ready) + repos + tests"
git push -u origin feat/superdrop-v2-persist-observability
```

## Kom i gang (lokalt)
```
cp .env.example .env
docker compose up -d db
npm i -D prisma
npm i @prisma/client prom-client
npx prisma generate
npx prisma db push
```

Wire rutene (se `PATCHES/WIRE_OBSERVABILITY.md`) og bytt til repoene etter behov.

## CI
- Unit: kjør uten DB (mock repos).
- Integrasjon: legg til Postgres som service i Actions senere, eller kjør mot en hosted test-DB.

## Akseptansekriterier
- `/healthz`, `/readyz` og `/metrics` svarer.
- Prisma client bygger, `db push` fungerer lokalt.
- Repos kan brukes i ruter (valgfritt i denne PR-en).
- Tester grønne (health/metrics).
