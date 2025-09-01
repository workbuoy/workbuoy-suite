# CRM Observability (Webhooks + Pipeline Throughput + API Latency)

## Metrikker
- **Webhooks**
  - `crm_webhook_success_total{provider=*}`
  - `crm_webhook_error_total{provider=*}`
- **Pipeline**
  - `crm_pipeline_transitions_total{pipeline_id, from_stage, to_stage}`
- **API latency (CRM)**
  - `crm_api_latency_ms_bucket/_sum/_count` – Histogram (ms)

## Eksempelspørringer (Grafana/PromQL)
```promql
sum by (provider) (increase(crm_webhook_error_total[5m])) / sum by (provider) (increase(crm_webhook_success_total[5m]) + increase(crm_webhook_error_total[5m]))
histogram_quantile(0.5, sum by (le) (rate(crm_api_latency_ms_bucket[5m])))
histogram_quantile(0.9, sum by (le) (rate(crm_api_latency_ms_bucket[5m])))
sum by (pipeline_id, to_stage) (increase(crm_pipeline_transitions_total[1h]))
```

## SLO-eksempler
- Webhook error-rate < **1%** per provider (5m rullerende)
- CRM API p90-latency < **200 ms** (5m)
- Pipeline transition throughput synliggjøres per stage for å fange flaskehalser

## Feilsøking
- Sjekk `/metrics` lokalt for å bekrefte at metrikker tikker.
- Verifiser at Ingress/ServiceMonitor skraper `/metrics` fra CRM API-podene.
