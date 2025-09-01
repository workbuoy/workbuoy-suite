# PR AW: Desktop Crash/Telemetry → OTEL & Grafana

## Innhold
- **Collector mock**: `scripts/otel_collector_mock.js` – OTLP/HTTP → Prometheus `/metrics`
- **Klient**: `desktop/telemetry/otel_client.js` – send sync-spans og crash-logs (OTLP/HTTP JSON)
- **Smoke**: `scripts/telemetry_smoke.js` – genererer syntetiske spans/crash, verifiserer metrics → `reports/telemetry_smoke.json`
- **CI**: `.github/workflows/desktop-telemetry-smoke.yml`
- **Grafana**: `grafana/dashboards/desktop_stability.json`
- **Docs**: `docs/DESKTOP_TELEMETRY.md`

## Kjappstart
```bash
node scripts/telemetry_smoke.js
```

## Rollback
- Deaktiver workflow; collector mock er isolert og påvirker ikke prod.
