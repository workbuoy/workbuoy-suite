
# Data Quality — Intelligent Cleanup Engine

## APIs
- `POST /api/data-quality/suggest` — accepts `{ records: [...], source? }` and returns cleanup suggestions with `confidence` and `why`. No writes.
- `POST /api/data-quality/approve` — accepts `{ suggestion_ids: [], approve: true }` and applies permissible suggestions per policy/RBAC. Audited to WORM.
- `GET /api/data-quality/queue` — list pending/failed suggestions (RBAC).

## Policies
- Auto-apply only if `confidence >= 0.85` **and** below high-value thresholds.
- Manual approval required for deals `> $500k` (default).
- Secure edition defaults may force read-only; write-backs disabled if `force_read_only=true` or `disable_automatic_writebacks=true`.

## Metrics
- `wb_data_quality_suggested_total`, `wb_data_quality_applied_total`
- `wb_data_quality_confidence_histogram`
- `wb_data_quality_failed_total{reason}`

## UI
`/public/admin/data-quality.html` — displays suggestions (86% width, 72vh table), shows **STALE** badge when cached/old.
