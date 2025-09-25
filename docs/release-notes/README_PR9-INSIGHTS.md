# PR9 — Insights Engine v1 (nudges)

## Innhold
- `src/insights/engine.ts` — deterministiske regler som produserer innsiktskort (ikke-enforcing).
- `src/routes/insights.ts` — `GET /api/insights` som returnerer `{ items: InsightCard[] }` fra mock CRM/finans.
- `tests/insights/insights.e2e.test.ts` — enkel smoke-test (krever at `apps/backend/src/server.ts` `app.use('/api/insights', insightsRouter())` er satt opp).

## Montering i server
Legg til følgende i `apps/backend/src/server.ts` (etter øvrige router-registreringer):

```ts
import { insightsRouter } from './routes/insights';
app.use('/api/insights', insightsRouter());
```

## Forventet output
```json
{
  "items": [
    {
      "kind": "credit_review_recommended",
      "title": "ACME: forfalt 89000 vs pipeline 450000",
      "evidence": { "overdue": 89000, "pipeline": 450000, "customerId": "C-1" },
      "severity": "moderate",
      "explanations": [
        {
          "reasoning": "Høy forfalt saldo samtidig som stor pipelinestørrelse – anbefaler kredittvurdering",
          "policyBasis": ["local:insight.creditReview"],
          "impact": { "minutesSaved": 10 }
        }
      ],
      "recommendation": {
        "capability": "ops.insight.suggestCreditReview",
        "payload": { "customerId": "C-1", "overdue": 89000, "pipeline": 450000 }
      }
    }
  ]
}
```

## Neste steg
- Koble innsiktskort til WhyDrawer i frontend.
- La en “Opprett review-task” knapp kalle Tasks-API for automatisk oppretting (policy-gated).
- Bytt mock-data med faktiske repos når persistens er på plass.
