# Audit Logging (PR A)

- Append-only `audit_events`
- WORM sikres via Postgres-triggere (`audit_events_no_update`/`audit_events_no_delete`)
- Kall via `src/audit/audit.ts::Auditor.record()`
- Korreler med `trace_id` (OTEL) i PR C/F

**DB**
Se `prisma/migrations/20250827_initial/migration.sql` eller kjør `prisma/extra/audit_worm.sql` hvis du bruker Prisma-genererte migrasjoner.