# PR I: Desktop notifikasjoner + OTEL + dashboards

## Endringsplan
- `desktop/src/notifications.ts` – OS-notifikasjoner
- `desktop/src/status.ts` – statusindikator via EventEmitter
- `desktop/src/telemetry/otel.ts` – OTEL tracer/meter, OTLP exporter, traceparent
- `desktop/src/sync/syncEngine.ts` – integrert OTEL + notifikasjoner + status
- `ops/dashboards/workbuoy.json` – Desktop-paneler (metrics)
- `docs/OTEL_DESKTOP.md` – oppsett og testing

## Kjøre lokalt
```bash
cd desktop
npm ci
npm run build
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 node dist/src/sync/demo.js
```

## Test
```bash
cd desktop
npm test
```

## Rollback
- Sett `DESKTOP_OTEL_ENABLED=false` (og ikke kall `initTelemetry()` i main) eller revert denne PR-en.
