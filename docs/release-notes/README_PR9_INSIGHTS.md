# PR9 — Insights Engine v1 (nudges, ikke enforce) + /api/insights

## Innhold
- `src/insights/engine.ts` — bygger enkle `InsightCard[]` (ex: `credit_review_recommended`) fra CRM-snapshot
- `src/core/http/routes/insights.ts` — `GET /api/insights` returnerer `{ items: InsightCard[] }` (mock CRM in-memory)
- `tests/e2e/insights.route.test.ts` — supertest-røyk (kort)

## Wiring
Registrér router i `apps/backend/src/server.ts`:
```ts
import { insightsRouter } from './core/http/routes/insights';
app.use(insightsRouter());
```

## Forventet atferd
- `GET /api/insights` → `{ items: [ { kind:'credit_review_recommended', ... } ] }` for mock-data
- UX kan vise `InsightsPanel` (kort + “Opprett review-task” senere)

## Neste steg
- PR10: Explainability ROI v1 + `/buoy/complete` med basis/impact i `explanations[]`
