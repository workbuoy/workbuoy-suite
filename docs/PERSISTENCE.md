# Persistence selection

Set `PERSIST_MODE` to choose storage:
- `file` (default): JSON files using FileRepo
- `pg`: Postgres using PgRepo (requires `USE_PG=1` and `PG_URL`)
- `prisma`: Prisma client using env model mapping `PRISMA_MODEL_<table>`

Examples:
```
PERSIST_MODE=file npm run dev
PERSIST_MODE=pg USE_PG=1 PG_URL=postgres://... npm run dev
PERSIST_MODE=prisma PRISMA_MODEL_crm_contacts=contact npm run dev
```
