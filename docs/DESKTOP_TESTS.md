# Desktop – E2E (konflikt) & Telemetry (PR AH)

Denne PR-en utvider testene med **konflikthåndtering** og **telemetry** samt en heftig **Redis-kø lasttest**.

## Konflikt – LWW & Merge
- Script: `desktop/tests/e2e_conflict.ts`
- Mock CRM aksepterer `PATCH /contacts/:id` og returnerer `409` hvis `updated_at` er eldre enn eksisterende verdi.
- **LWW**: motoren retryer med `?force=1` og overskriver server.
- **Merge**: motoren henter serverens versjon og flettes felt (server bevares, lokale patcher lærer over egne felt).

Kjør:
```bash
cd desktop
npm ci && npm run build
npm run test:conflict
```

## Telemetry – OTLP mock
- Mock collector: `desktop/tools/otel/mock_otlp.ts` lytter på `:4318/v1/traces`
- Verifisering: `desktop/tests/telemetry_verify.ts` sender 2 spans og validerer `reports/otlp_mock.json`

Kjør:
```bash
npm run build
npm run test:telemetry
```

## Last-test Redis
- Script: `desktop/tools/load/redis_blast.ts`
- Kjør med Redis tilgjengelig:
```bash
WB_REDIS_N=5000 REDIS_URL=redis://localhost:6379 npm run test:redisblast
```
- Rapport: `reports/sync_load.json` med `throughput_ops_per_s`, `p95_ms`, `p99_ms`, `errors`.

## Grafana
- Importer `ops/dashboards/desktop_sync_health.json` i Grafana.
- Pek panel #1 til Tempo/Prometheus datasource med riktig metrikknavn for OTLP-spans hos dere.

## CI
- Workflow: `.github/workflows/desktop-e2e-conflict-telemetry.yml` kjører konflikttest, telemetry og Redis-blast på Ubuntu med Redis-service.
