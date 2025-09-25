# PR12 - Resilience v1 (circuit breaker + manual-complete)

Contents:
- src/core/circuit.ts - simple circuit breaker
- src/connectors/finance.resilient.ts - wrapper to protect a FinanceConnector with breaker
- src/routes/manual.complete.ts - POST /api/manual-complete (audit-only)
- openapi/manual.yaml - OpenAPI spec
- tests/core/circuit.test.ts, tests/routes/manual.complete.test.ts

Mount:
```ts
import { ResilientFinanceConnector } from './connectors/finance.resilient';
import { MockFinanceConnector } from './connectors/finance.mock';
const resilient = new ResilientFinanceConnector(MockFinanceConnector as any);
app.set('financeConnector', resilient);

import { manualCompleteRouter } from './routes/manual.complete';
app.use('/api', manualCompleteRouter());
```

Expected:
- Breaker opens after repeated failures, half-opens after backoff, then closes on success.
- Manual completions are recorded in IntentLog (audit).

Next:
- Expose breaker/DLQ metrics endpoints and wire into dashboards.
