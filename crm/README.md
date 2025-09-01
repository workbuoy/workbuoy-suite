# workbuoy-crm

## Metrics
- `/api/metrics` exposes Prometheus counters

## Seed
`npm run seed`

## Feature flag
Set `WB_FEATURE_CRM=true` (default true if unset). When disabled, `/portal/crm` returns 404.

## CSV import
POST `/api/import/csv` with JSON `{ "kind":"contacts"|"companies", "csv":"name,email,company\n..." }`
