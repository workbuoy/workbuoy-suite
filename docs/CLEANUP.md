# Consolidation plan
- Remove legacy/duplicate routes:
  - any old `core/eventBus.ts` if `core/events/*` exists
  - any legacy `core/logger.ts` if `core/logging/logger.ts` exists
  - old `/api/log` routes, keep `/api/logs`
- Ensure write endpoints use the same policy guard (v2)
- Prefer imports via `src/core/index.ts` barrel
- OpenAPI: one spec per domain; keep aligned with implementation
