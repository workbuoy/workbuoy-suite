# PR10 — Explainability ROI i /buoy/complete

## Filer
- `src/core/explain.ts` — helper for Explanation[] (WhyDrawer).
- `src/router/nl.ts` — enkel NL→capability router.
- `src/routes/buoy.complete.ts` — POST `/buoy/complete` implementasjon.
- `openapi/buoy.yaml` — oppdatert spes for endepunktet.
- `tests/http/buoy.complete.e2e.test.ts` — supertest røyk.

## Montering
Legg til i `src/server.ts` (etter middleware og før error handler):
```ts
import { buoyRouter } from './routes/buoy.complete';
app.use('/buoy', buoyRouter());
```

## Forventet
- Respons inneholder alltid `explanations[]` med `policyBasis` og `impact` (ROI).
- Ved deny/degrade returneres forklaringene, `result` kan være `undefined`.
- UI/WhyDrawer kan lese `explanations[0]` for å vise basis + ROI.
```json
{
  "result": { "ok": true },
  "explanations": [
    {
      "reasoning": "Prepare allowed at Ambisiøs (>=4)",
      "policyBasis": ["local:rule.cap.finance.prepareDraft","autonomy:4"],
      "impact": { "minutesSaved": 18, "dsoDeltaDays": 3 }
    }
  ],
  "correlationId": "…",
  "confidence": 0.8
}
```
