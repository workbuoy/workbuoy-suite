# Ops Notes: Proactivity

## Metrics

`GET /metrics` now exposes Prometheus text. Today we export a placeholder gauge `proactivity_dummy 1`. Future work will replace this with `prom-client` metrics (mode distribution, degradations, overrides). Scrape interval: 15s.

## Grafana Dashboard

Import `grafana/dashboards/proactivity.json` into your Grafana instance. The stub contains panels for:

- Effective mode distribution (to wire to histogram once metrics land)
- Degradation count
- Override / kill-switch activations

Point the data source at the Prometheus scraping `/metrics`.

## Subscription Admin

`/api/admin/subscription` provides plan + kill switch management. Secure tenants degrade to `proaktiv` automatically. Use this route in incident playbooks before adjusting automation modes.
