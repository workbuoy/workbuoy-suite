# PR1 — Consolidate logging with correlation IDs

This patch makes `src/core/logger.ts` a compatibility alias that re-exports the canonical
logger from `src/core/logging/logger.ts`. All legacy imports will now resolve to the same
implementation (with PII masking and correlationId support).

## What changed
- `src/core/logger.ts` now re-exports `src/core/logging/logger.ts` (single source of truth).
- Added a skipped test placeholder `tests/logging.correlation.test.ts` describing the
  correlationId expectation (convert to a live test once the logger exposes a hook).

## Follow‑up (one-time repo hygiene)
- Grep and switch direct imports to the canonical path:

  ```bash
  git grep -n "from '.*core/logger'" | cut -d: -f1 | sort -u \    | xargs -I{} sed -i '' "s#core/logger#core/logging/logger#g" {}
  ```

- Verify that your requestContext middleware sets `req.wb.correlationId` and that the logger
  includes `{ correlationId }` in structured JSON output.

## Commit message suggestion
```
chore(logging): unify logger via alias, prepare correlationId enforcement
```
