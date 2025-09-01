# PR R: Import/Export + DLQ admin

## Endringsplan
- `backend/src/crm/import_export_routes.ts` – implementerer import (CSV/JSON), eksport, DLQ-list/replay
- `backend/src/metrics/metrics.ts` – nye metrikker (wb_import_total, wb_import_fail_total, wb_export_total)
- `backend/tests/import_export.test.ts` – tester CSV-import og DLQ-replay
- `docs/IMPORT_EXPORT.md` – spesifikasjon og bruk

## Test-kommandoer
```bash
cd backend
npm ci
npm run build
npm test
```

## Manuell validering
- POST CSV med én gyldig og én ugyldig rad, bekreft DLQ>0, replay, og eksport JSON med 1 objekt.

## Rollback
- Skru av ruten i `src/app.ts` midlertidig, eller eksponer kun i dev-miljø.
