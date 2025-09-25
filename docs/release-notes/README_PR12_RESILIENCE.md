# PR12 — Resilience v1 (circuit-breaker, degrade to simulate, manual-complete)

## Innhold
- `src/core/circuit.ts` — enkel circuit breaker (threshold + cooldown)
- `src/connectors/resilient.ts` — `makeResilientFinance()` wrapper rundt hvilken som helst `FinanceConnector`
- `src/finance/orchestrator.ts` — oppdatert: try/catch rundt `simulate/execute` for degradering
- `src/core/http/routes/manual.complete.ts` — `POST /api/manual-complete` (audit/intent-log for manuell fullføring)
- Tester:
  - `tests/unit/circuit.test.ts` — åpne/lukke bane
  - `tests/e2e/manual.complete.test.ts` — røyk for endpoint

## Wiring
1) Pakk resilient connector og bruk den ved oppstart (dev/staging):
```ts
import { makeResilientFinance } from './connectors/resilient';
import { MockFinanceConnector } from './connectors/finance.mock';
import { FinanceOrchestrator } from './finance/orchestrator';

const finance = new FinanceOrchestrator(makeResilientFinance(MockFinanceConnector));
// ... pass `finance` til flows (deal-to-cash, overdue-to-reminder) i stedet for å instansiere på nytt i ruter
```

2) Registrér manual-complete route i `apps/backend/src/server.ts`:
```ts
import { manualCompleteRouter } from './core/http/routes/manual.complete';
app.use(manualCompleteRouter());
```

3) Feature flag:
```
FF_RESILIENCE_V1=1
```

## Forventet atferd
- Ved gjentatte feil mot connector åpnes breaker og kaster `circuit_open` raskt.
- `prepareDraft`/`forecastCashflow` returnerer degraderte resultater (f.eks. tom forecast) ved feil i simulate.
- `sendInvoice` på L5 feiler execute → runner degraderer til `prepare` (utkast) med `degraded=true`.
- Manuelle fullføringer kan logges via `/api/manual-complete` og vises i audit/intent-log.

## Røyk
```bash
# Manual complete
curl -X POST http://localhost:3000/api/manual-complete   -H 'content-type: application/json'   -d '{"capability":"finance.invoice.send","payload":{"invoiceId":"INV-9"},"outcome":{"marked":true}}'
```

## Videre
- Koble breaker-metrikker til OTel (spans/attrs) og eksponer health i `/readyz` (breaker state).
- Persistér DLQ og intent-log til DB i neste persistens-epic.
