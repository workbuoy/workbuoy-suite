
# PR10 — Explainability ROI v1 + `/buoy/complete` (NL→capability + explanations[])

## Innhold
- `src/core/explain.ts` — helper som bygger `explanations[]` med `reasoning`, `policyBasis`, `impact`
- `src/router/router.ts` — enkel NL-router som mapper tekst → capability
- `src/core/http/routes/buoy.complete.ts` — `POST /buoy/complete`:
  - Leser `{ text }` eller `{ intent, params }`
  - Kaller `runCapability()`
  - Returnerer alltid `explanations[]` (inkl. ROI for `finance.invoice.prepareDraft` via `policy.impact`)
  - Når `policy.allowed === false` → HTTP 403 med `explanations[]`
- `tests/e2e/buoy.complete.test.ts` — NL-happy-path + 403-path

## Wiring
I `src/server.ts`:
```ts
import { buoyRouter } from './core/http/routes/buoy.complete';
app.use(buoyRouter());
```

## Forventet atferd
- `POST /buoy/complete` med `{ text: "lag fakturautkast ..." }` og `x-autonomy-level: 4` → 200, `explanations[0].impact.minutesSaved` finnes.
- `POST /buoy/complete` med `{ intent:"finance.invoice.send" }` og `x-autonomy-level: 4` → 403 + `explanations[0].policyBasis`

## Neste steg
- PR11: Overdue → Reminder (suggest-only, draft e-post)
- PR12: Resilience v1 (circuit-breaker, manual-complete)
