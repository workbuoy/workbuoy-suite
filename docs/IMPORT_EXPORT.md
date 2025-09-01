# Import/Export + DLQ Admin

## Import
`POST /api/v1/crm/import` (multipart/form-data)
- **Headers**: `Idempotency-Key` (valgfritt), `x-tenant-id`
- **Fields**: `entity` (contacts|opportunities), `dry_run` (bool), `file` (CSV/JSON)
- **Validering**:
  - contacts: `name` påkrevd
  - opportunities: `title` påkrevd
- **Respons**: `{ entity, imported, failed, failures[], dry_run }`

## Export
`GET /api/v1/crm/export?entity=contacts&format=json|csv`
- Returnerer `application/json` (`{ items, next_cursor }`) eller `text/csv`

## DLQ Admin
- `GET /api/v1/crm/dlq?n=50` – hent siste N DLQ-elementer
- `POST /api/v1/crm/dlq/replay` – `{ ids:[] }` re-spiller (MVP: fjerner fra DLQ)

## Observability
- Prometheus metrikker:
  - `wb_import_total`
  - `wb_import_fail_total`
  - `wb_export_total`
