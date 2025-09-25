# PR P: Desktop crash-telemetry + dashboards

## Endringsplan
- **Telemetry**: `desktop/src/telemetry/otel.ts` – nye metrics (crash, client error, sync latency)
- **Crash**: `desktop/src/telemetry/crash.ts` – globale handlers + fil-rotasjon (50)
- **Sync**: `desktop/src/sync/syncEngine.ts` – registrer `desktop_sync_latency_ms`
- **Dashboard**: `ops/dashboards/workbuoy.json` – crash-rate & latency-paneler
- **Docs**: oppdatert `docs/OTEL_DESKTOP.md`
- **CI**: `.github/workflows/desktop-crash-telemetry.yml` – røyk-test

## Test-kommandoer
```bash
cd desktop
npm ci && npm run build
node dist/tests/crash_smoke.js
```

## Manuell validering
- Forårsake en feil i appen og verifiser at det dukker opp en fil i `crashlogs/` og at metrikker sendes til OTEL Collector.

## Rollback
- Ikke kall `installCrashHandling()` i appens oppstart og/eller disable workflowen.
