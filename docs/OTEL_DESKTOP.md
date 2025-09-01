# Desktop OTEL & Crash-telemetry (oppdatert)

## Crash capture
- Globale handlers for `uncaughtException` og `unhandledRejection` via `installCrashHandling()`.
- Logger JSON-filer i `crashlogs/` (maks 50 beholdes). Eksempel payload: `{ kind, ts, message, stack }`.
- Øker metrikken `desktop_crash_total` for hver hendelse.
- Under `CRASH_TEST_MODE=1` termineres ikke prosessen (brukes i røyk-test).

## Telemetry (nytt)
- `desktop_crash_total` – counter
- `desktop_client_error_total` – counter
- `desktop_sync_latency_ms` – histogram (registrert per `syncOnce()`)

## Dashboards
- Nye paneler i `ops/dashboards/workbuoy.json`: crash-rate (5m), client error-rate, og p50/p90 sync latency.

## SLO-forslag
- Crash-rate < 0.5/h per 100 aktive klienter.
- Sync p90 < 5s i normal last.

## Lokal test
```bash
cd desktop
npm ci && npm run build
node dist/tests/crash_smoke.js
```
