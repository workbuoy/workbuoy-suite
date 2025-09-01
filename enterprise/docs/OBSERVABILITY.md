# Observability

Metrics: request_total, request_duration_seconds, http_5xx_total

## Business Funnel Metrics

- `wb_onboarding_started_total{module}`
- `wb_onboarding_completed_total{module}`
- `wb_trial_started_total{module,plan}`
- `wb_trial_converted_total{module,plan}`
- `wb_trial_expired_total{module,plan}`
- `wb_plan_changed_total{from,to}`
- `wb_flex_paid_total{type}`
- `wb_enterprise_lead_submitted_total`

Scrape: `GET /api/metrics`. Quick test increments: `/api/metrics?ev=onboarding_started&module=core`.

## CXM Signals Metrics

- `wb_signals_emitted_total{type,source}`
- `wb_signals_shown_total{type}`
- `wb_signals_acted_total{type}`
- `wb_signals_ignored_total{type}`

SLO: **≥30% acted / shown** for høy-score (score ≥ 0.75) signaler.

Eksponert via `GET /api/metrics`.

## Integrations Metrics

- `wb_integrations_suggested_total{provider}`
- `wb_integrations_connect_started_total{provider}`
- `wb_integrations_connected_total{provider}`
- `wb_integrations_failed_total{provider}`

Eksponert via `GET /api/metrics`.
