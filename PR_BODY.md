# feat(ux): Predictive Loading States v2 (PR-23)

**Hva**
- Utvider `usePredictivePrefetch` med per-dag plan og menneskelig melding.
- Ingen nye UI-komponenter; eksisterende skeleton bruker den nye teksten/planen.

**Hvordan teste**
- Kjør appen på mandag: se “Laster mandagsrapporter…”. Ellers “Forbereder morgenoversikten…” eller “Henter det du vanligvis trenger…”.

**Risiko/rollback**
- Patch av v1-hook. Ingen backend-endringer.