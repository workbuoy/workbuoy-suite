# Consolidation plan
- Remove legacy/duplicate routes:
  - core/eventBus.ts (if priority bus exists under core/events/...)
  - any legacy logger duplications in core/logger.ts vs core/logging/logger.ts
  - old /api/log vs /api/logs route files
- Ensure write endpoints all import the same policy guard (policy v2)
- One OpenAPI per domain (crm.yaml, tasks.yaml, log.yaml, finance.yaml, buoy.yaml, manual.yaml)
- Mark old files with `@deprecated` before deletion in a short PR if unsure
