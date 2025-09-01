# CRM Datamodell (Prisma) + RBAC + Audit

## Entiteter
- Tenant, User, Organization, Contact, Pipeline, Stage, Opportunity, Activity
- CustomFieldDef, CustomFieldValue (typed custom fields)
- RoleBinding (RBAC: admin/manager/contributor/viewer; resource-granular)
- AuditLog (mutasjoner med old/new)

## Migrasjoner
```bash
cd backend
npm i -D prisma @prisma/client
npx prisma generate
DATABASE_URL="postgresql://user:pass@localhost:5432/workbuoy" npx prisma migrate dev --name init_crm
```

## Repo-lag
- `backend/src/crm/repo.ts` – CRUD med audit logging
- RBAC-stub i `backend/src/middleware/rbac.ts`

## API (DB-backed)
- `backend/src/crm/routes.db.ts` – mounts typisk på `/api/v1/crm` (erstatt gamle routes)

## Audit
- Hver mutasjon skriver til `AuditLog` og kan eksporteres til fil (se PR L)

## Observability
- Legg spans rundt repo-kall (kan gjøres i senere PR med OTEL)

## Test-strategi
- Kjør med SQLite i dev (`provider = "sqlite"`) ved behov; i prod bruk Postgres.
- E2E: seed tenanter/brukere og kjør CRUD via `supertest` mot Express.
