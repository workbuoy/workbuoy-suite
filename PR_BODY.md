
# feat(ux): Buoy interaksjonskontrakt (schema + stub)

**Hva**
- Definerer meldingsschema (`UserMessage`, `AssistantMessage`, `VisualizationAttachment`, `ActionSuggestion`).
- Nytt hook `useBuoy.ts` som simulerer respons (stub).
- Oppdatert `BuoyChat.tsx` → bruker hook, viser actions og "Vis hvorfor".
- Ny komponent `WhyDrawer.tsx` for forklarbarhet.
- Ny dokumentasjon `docs/buoy.md` (gradert autonomi).

**Hvorfor**
Gir forutsigbart API mellom UI ↔ backend, og forklarbarhet i alle svar.

**Hvordan teste**
- `cd frontend && npm run dev`
- Skriv melding i Buoy → stub-svar med tekst + [visualisering] + "Vis hvorfor"-knapp.

**Risiko/rollback**
- Kun frontend + docs. Ingen backend/CI-endringer. Trygt å reverte.

**TODO (@dev)**
- Implementere ekte AI-pipe mot CORE.
- Logging av provenance og persistens.
