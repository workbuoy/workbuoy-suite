# PR F: Grafana dashboards + alerts

- Dashboard JSON: `ops/dashboards/workbuoy.json`
- PrometheusRule alerts: `ops/alerts/workbuoy_alerts.yaml`
- Helm values: `ops/helm/values.yaml`
- Docs: `docs/OBSERVABILITY.md`

## Test commands
```bash
python -m json.tool ops/dashboards/workbuoy.json
kubectl apply -f ops/alerts/workbuoy_alerts.yaml --dry-run=client -o yaml
```

## Manual validation
- Import dashboard into Grafana and check panels populate.
- Verify alert rules appear in Prometheus Operator.
- Toggle `serviceMonitor.enabled=false` in Helm values for rollback.
