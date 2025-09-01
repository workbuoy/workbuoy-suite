# PR A: CRM schemas + RBAC + audit

## Kjør lokalt
```bash
cd backend
cp .env.example .env
npm ci
npm run build
npm test
```

## Database
- Kjør migrasjon (raw SQL):
```bash
psql "$DATABASE_URL" -f prisma/migrations/20250827_initial/migration.sql
```
- Hvis du bruker `prisma migrate dev`, kjør i tillegg WORM-scriptet:
```bash
npm run prisma:gen
npm run prisma:migrate
npm run db:worm
```

## Neste PR (B): CRM CRUD API + Swagger
- Legg til ruter `/api/v1/crm/{pipelines,contacts,opportunities}`
- Krev headers: `x-api-key`, `Idempotency-Key` (for mutasjoner)
- Generér OpenAPI paths og eksponeer Swagger UI på `/api-docs`
- Bind RBAC-policy i ruter
- Logg audit events ved CRUD