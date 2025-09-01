# Desktop Crash/Telemetry → OTEL & Grafana (PR AW)

Denne PR-en etablerer en enkel OTEL-kjede for desktop-klienten med en **OTLP/HTTP collector mock**, Prometheus-metrikker og Grafana-paneler.

## Komponenter
- **Collector mock**: `scripts/otel_collector_mock.js`
  - Inngang: `POST /v1/traces`, `POST /v1/logs` (OTLP/HTTP JSON)
  - Utgang: `/metrics` (Prometheus text)
  - Metrikker:
    - `desktop_crash_total{env,channel,version}`
    - `sync_latency_seconds_bucket` (Histogram med `{env,channel,version}`)
- **Desktop OTEL-klient**: `desktop/telemetry/otel_client.js`
  - `sendSyncSpan({ endpoint, env, channel, version, durationMs })`
  - `sendCrash({ endpoint, env, channel, version, type, message })`

## Labels
- `env`: `deployment.environment`
- `channel`: `release.channel`
- `version`: `service.version`

## Demo / Smoke
```bash
# Kjør smoke-test (starter collector, sender spans+crash, verifiserer /metrics)
node scripts/telemetry_smoke.js
cat reports/telemetry_smoke.json
```

## Grafana
Importer `grafana/dashboards/desktop_stability.json`. Datasource-UID må peke til din Prometheus (uid: `PROM` i malen).
Paneler:
- **Crash rate per version** (rate over 5m)
- **Sync latency p95** via `histogram_quantile`
- **Crashes (last 1h)** og **Active versions**

## Videre arbeid
- Bytt mock med ekte **OpenTelemetry Collector** (otlp → prometheusremotewrite) eller OTEL exporter i appen.
- Legg til **exemplar support** og **traceID**-lenker fra metrics til tracing UI (Tempo/Jaeger).
