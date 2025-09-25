# PR AK: Connector observability – dashboards & alerts

## Endringsplan
- **Dashboard**: `ops/dashboards/connector_health.json`
- **Alerts**: `ops/alerts/connector_alerts.yml`
- **Docs**: `docs/CONNECTOR_OBSERVABILITY.md`
- **CI**: `.github/workflows/observability-validate.yml` (jq/yamllint/promtool)

## Manuell validering
1. Importer dashboard i Grafana.
2. Last alert-regler i Prometheus (eller Operator) og kjør `promtool check rules`.
3. Simulér ingest/feil med testmiljø og se paneler/varsler trigge.

## Rollback
- Fjern/disable alert-reglene og slett dashboardet fra Grafana; behold filer for senere re-enable.
