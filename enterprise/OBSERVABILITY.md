
# Observability

## Metrics (/api/metrics)
- `wb_experiment_active{experiment,variant}`
- `wb_experiment_rollback_total`
- `wb_connector_errors_total{connector="hubspot"}`
- `wb_connector_latency_ms_sum/count{connector="hubspot"}`
- `wb_dsr_requests_total`

## Alerts
- Experiment SLO breach ⇒ auto-rollback (simulated via SLO watch).



## New Metrics
- wb_dq_score_avg, wb_dq_low_quality_total, wb_dq_auto_fixes_total, wb_dq_approvals_total
- wb_connector_errors_total{connector}, wb_connector_p95_ms{connector}, wb_circuit_opens_total{connector}
- wb_scoring_batch_time_ms, wb_scoring_cache_hit_ratio, wb_scoring_throughput_per_s, wb_scoring_perf_rating

