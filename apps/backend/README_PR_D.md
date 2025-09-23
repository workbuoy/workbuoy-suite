# PR D: Batch import/eksport + DLQ

## Kjøring
```bash
cd backend
cp .env.example .env
npm ci && npm run build
node dist/index.js
```

## Import (dry-run CSV)
Se `docs/IMPORT_EXPORT.md` for curl-eksempler.

## Metrics
Prometheus-metrikker på `http://localhost:3000/metrics`.

## Feature flag
`CRM_IMPORT_EXPORT_ENABLED=false` for å deaktivere endepunktene.
