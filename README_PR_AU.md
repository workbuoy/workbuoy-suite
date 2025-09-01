# PR AU: Prod tuning & Alert Hygiene

## Innhold
- **Prometheus regler**: `ops/alerts/rules/ingest.yaml`, `ops/alerts/rules/errors.yaml`
- **Alertmanager**: `alertmanager/config.yaml` med `time_intervals` (08–18 Europe/Oslo)
- **Grafana**: `grafana/dashboards/ops_overview.json` med `$env`-variabel, provider-filter og DLQ-trend
- **Runbook**: `docs/ALERT_HYGIENE.md`
- **CI**: `.github/workflows/alert-hygiene-lint.yml` (promtool, amtool, yamllint, jq)

## Slik brukes det
1. Legg til/merge regler og config i infra repoet.
2. Kjør lint-workflow; fiks ev. avvik.
3. Importér dashboardet i Grafana og sett datasource `PROM`.

## Rollback
- Reverter regler/Alertmanager-endringer; behold dashboardene for inspeksjon.
