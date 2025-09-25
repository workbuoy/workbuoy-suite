# PR8 — Finance Orchestrator (simulate-first) + Connector SDK + deal→cash event binding + dev routes

## Innhold
- `src/connectors/finance.ts` — Connector SDK interface
- `src/connectors/finance.mock.ts` — Mock connector
- `src/finance/orchestrator.ts` — Orchestrator (`prepareDraft`, `sendInvoice`, `forecastCashflow`, `suggestReminder`) — runner-drevet
- `src/flows/deal-to-cash.ts` — Subscribes to `crm.deal.closed` → calls `prepareDraft` (simulate at L<=4)
- `src/core/http/routes/finance.dev.ts` — Dev-only routes:
  - `POST /api/_dev/deal-won` — publiserer `crm.deal.closed`
  - `POST /api/_dev/finance/prepareDraft` — direkte simulate for testing
- `tests/e2e/finance.orchestrator.test.ts` — røyk mot dev-route

## Integrasjon
- Registrér `financeDevRouter()` i `apps/backend/src/server.ts` **kun i dev** (`NODE_ENV !== 'production'`).
- Kall `registerDealToCash(new FinanceOrchestrator(MockFinanceConnector))` ved server-oppstart (bak feature flag `FF_FINANCE_ORCH`).

## Forventet atferd
- `POST /api/_dev/finance/prepareDraft` med `x-autonomy-level: 4` returnerer `{ outcome: { previewUrl }, mode:'simulate' }`.
- Event `crm.deal.closed` (via `/api/_dev/deal-won`) trigget → orchestrator `prepareDraft` kjøres (simulate).

## Neste steg
- PR9: Insights Engine v1 (nudge, ikke enforce)
- PR10: Explainability ROI v1 + Buoy route utvidelse
