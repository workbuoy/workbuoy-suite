# PR AB: CRM model + CRUD + import/export

## Endringsplan
- **DB & migrasjoner**: `src/db/migrate.ts` oppretter tabeller (SQLite). `npm run migrate` brukes i CI og lokalt.
- **Repos**: `src/crm/repo.ts` – generisk CRUD for tabeller (inkl. `custom_fields` JSON).
- **API**: `src/crm/routes.ts` – `GET/POST/PATCH/DELETE` for pipelines/contacts/opportunities; `POST /import`, `GET /export`.
- **RBAC**: `src/rbac/enforce.ts` – header-basert rolle-check (viewer/contributor/manager/admin).
- **Observability**: latency-histogram + `audit_events_total`; audit på alle mutasjoner (`crm.mutation`). `/metrics` eksponert.
- **Tester**: CRUD + import/export via `supertest`.
- **Docs**: `docs/CRM_MODEL.md`.
- **CI**: `.github/workflows/crm-model-tests.yml`.

## Kommandoer
```bash
cd backend
npm ci
npm run build
npm run migrate
npm test
node dist/index.js
```

## Manuell validering
```bash
# Opprett kontakt
curl -XPOST http://localhost:3000/api/v1/crm/contacts -H 'x-tenant-id: t1' -H 'x-user-role: admin' -H 'Content-Type: application/json' -d '{"name":"Alice"}'
# Eksporter
curl 'http://localhost:3000/api/v1/crm/export?entity=contacts' -H 'x-tenant-id: t1' -H 'x-user-role: viewer'
# Metrics
curl http://localhost:3000/metrics
```

## Rollback
- Sett `CRM_PERSIST_DISABLED=true` (hvis relevant i miljø) eller rull tilbake deployment. DB-filer er lokale (SQLite).
