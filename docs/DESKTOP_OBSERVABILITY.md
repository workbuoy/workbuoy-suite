# Desktop Observability

## Notifikasjoner
- Bruker OS-notifikasjoner (Electron `Notification`) eller fallback til logg.
- Varsler ved sync-feil og når sync er ferdig.

## OTEL
- Bruker `@opentelemetry/api` og `@opentelemetry/exporter-trace-otlp-http`.
- Konfig via `DESKTOP_OTEL_ENABLED` (default true) og `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Sender spans for `desktop.sync.flush` og `desktop.sync.pull`.

## Dashboard
- `ops/dashboards/workbuoy_desktop.json` inkluderer sync success, sync errors, flush duration, crash rate.
