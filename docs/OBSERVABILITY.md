# Observability: Grafana & Alerts

## Dashboard
Import `ops/dashboards/workbuoy.json` into Grafana:
1. Open Grafana → Dashboards → Import
2. Upload JSON file
3. Select Prometheus datasource

## Alerts
Apply PrometheusRule:
```bash
kubectl apply -f ops/alerts/workbuoy_alerts.yaml
```

- `HighImportFailureRate`: triggers if >5% imports fail over 5m
- `ConnectorErrors`: triggers if connector errors >0 over 10m

## Helm values
`ops/helm/values.yaml` enables Prometheus Operator ServiceMonitor.

## Validation
CI will run JSON schema validation on dashboard.
