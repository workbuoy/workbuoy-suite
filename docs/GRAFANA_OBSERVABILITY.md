# Grafana & Alerts

## Dashboard
- Importer `ops/dashboards/workbuoy.json` i Grafana.
- Paneler:
  - CRM: import/failed/export + failure rate
  - Connectors: ingest/errors/retries + by provider
  - Desktop: placeholder (kobles i PR J)

## Prometheus/Alerts
- Bruk `ops/alerts/workbuoy_alerts.yaml` (PrometheusRule).
- Krever Prometheus Operator (kube-prometheus-stack) og at `/metrics` scrapes.

## Helm
- Sett `metrics.serviceMonitor.enabled=true`.
- `ServiceMonitor`-mal finnes i `ops/helm/workbuoy/templates/servicemonitor.yaml`.

## Validering
- Sjekk `/metrics` endepunkt i backend.
- Se at paneler begynner å vise data når du kjører import (PR D) og connector webhooks/worker (PR E).
