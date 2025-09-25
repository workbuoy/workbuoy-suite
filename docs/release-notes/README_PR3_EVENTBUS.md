# PR3 — Standardize on priority event bus (+ DLQ debug)

This patch unifies event publishing/consumption on the in-memory **priority bus**:
- Single import surface: `import bus from "src/core/events/priorityBus"` (or legacy `src/core/eventBus` now aliased).
- Priority order: **high > medium > low**, FIFO within priority.
- Retries and **DLQ** after `BUS_MAX_ATTEMPTS` (default 3).
- Dev introspection: `GET /api/_debug/dlq`.

## What changed
- `src/core/eventBus.ts` now re-exports the priority bus (backwards compatible).
- `src/core/http/routes/debug.dlq.ts` added (dev-only route).
- `tests/events.priorityBus.integration.test.ts` verifies priority + DLQ.

## Wiring
- Ensure your server registers the debug route in dev:
  ```ts
  import dlqDebug from "./core/http/routes/debug.dlq";
  if (process.env.NODE_ENV !== "production") {
    app.use(dlqDebug);
  }
  ```

- Replace any remaining imports (optional hygiene):
  ```bash
  git grep -n "from '.*core/eventBus'" | cut -d: -f1 | sort -u \    | xargs -I{} sed -i '' "s#core/eventBus#core/events/priorityBus#g" {}
  ```

## Run tests
```
npm test -- --runTestsByPath tests/events.priorityBus.integration.test.ts
```

## Commit message suggestion
```
feat(events): standardize on priority event bus; add DLQ debug route; add priority+DLQ test
```
