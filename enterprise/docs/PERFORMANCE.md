
# Performance — Batch, Cache, Auto-tune

## Batch Scoring
- `lib/perf/scoringBatcher.js` batches inputs and controls concurrency.
- Auto-tunes batch size by p95 latency; falls back to per-item if needed.

## Cache
- Multi-level cache: L1 in-memory LRU, L2 sqlite table with TTL.
- Soft invalidation hooks on write operations can invalidate keys.

## Metrics
- `wb_signal_batch_latency_ms` (histogram), `wb_scoring_p95_ms` (gauge).

## Endpoint
- `POST /api/signals/score-batch` — `{ signals: [] }` → `{ results: [], p95_ms_estimate }`
