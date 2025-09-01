# Connector Observability (PR AK)

Dette leverer et ferdig **Grafana-dashboard** og **Prometheus alert-regler** for Salesforce- og Dynamics-connectorene.

## Dashboard
Fil: `ops/dashboards/connector_health.json`  
Paneler:
- Ingest rate (records/s) for SF/Dynamics
- Error rate (%) for SF/Dynamics
- DLQ-økning siste 5m
- p95 ingest-latens (placeholder – krever `wb_connector_ingest_latency_seconds_bucket`)
- Retries per sekund (placeholder – `wb_connector_retries_total`)

## Alerts (PrometheusRule)
Fil: `ops/alerts/connector_alerts.yml`
- `ConnectorHighErrorRate{Salesforce,Dynamics}` – feilrate > 2% i 10m
- `ConnectorDLQNonZero{Salesforce,Dynamics}` – DLQ aktivititet i 5m
- `ConnectorNoIngest30m` – ingen ingest i 30m (foreslå begrensning til arbeidstid via Alertmanager time intervals)

### Merk om arbeidstid
Begrens varsler i arbeidstid via Alertmanager `time_intervals` (ruting), f.eks. 09:00–17:00 Europe/Oslo.

## Import og validering
- Grafana: *Dashboards → Import → Upload JSON*.
- Prometheus/Operator: legg `connector_alerts.yml` i rules. Test i promtool:
```bash
promtool check rules ops/alerts/connector_alerts.yml
```

## Datasource-forventninger
- Prometheus scraping eksponerer countere: `sf_ingest_total`, `sf_errors_total`, `sf_dlq_total`, `dyn_ingest_total`, `dyn_errors_total`, `dyn_dlq_total`.
- (Valgfritt) histogram `wb_connector_ingest_latency_seconds_bucket` for p95/p99.
