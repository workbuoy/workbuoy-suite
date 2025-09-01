
# Integrations — Circuit Breakers, Fallbacks, Health

## Circuit Breakers
- Per connector (e.g., salesforce, d365, hubspot, qlik).
- Open after ≥5 consecutive failures; half-open after cooldown; close on success.

## Fallbacks
- Cached reads when down; writes queued to retry queue.
- Conflict resolution strategy: source priority, timestamp, data quality scoring.

## Tables
- `integration_health`, `retry_queue`, `dlq`.

## Metrics
- `wb_integration_circuit_open{connector}`
- `wb_retry_queue_depth{connector}`, `wb_dlq_depth{connector}`

## Endpoints
- `GET /api/integration/health`
- `POST /api/integration/retry` (RBAC)
