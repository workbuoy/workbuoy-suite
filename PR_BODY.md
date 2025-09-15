# feat(ux): Undo That Thinks Ahead (PR-16)

**Hva**
- `SmartUndoProvider` + `useSmartUndo()` for hendelser → undo-forslag.
- `UndoChips` som rendrer forslag under Buoy-feed; klikker åpner WhyDrawer.
- Patch for `FlipCard` (wrap med SmartUndo), `ContactsPanel` (emit create/delete), `BuoyChat` (vis UndoChips).
- `docs/undo.md` dokumenterer prinsipper og videre plan.

**Hvorfor**
- Brukere gjør feil når tempoet er høyt. Proaktiv “angre” senker stress og øker trygghet.

**Hvordan teste**
- `npm run dev` i `frontend`.
- Åpne **Navi → Kontakter**, opprett en kontakt → se chip “Angre opprettelse …” i Buoy.
- Slett en kontakt → se chip “Angre sletting …” i Buoy.
- Klikk chip → WhyDrawer med forklaringer (stub).

**Risiko/rollback**
- Kun frontend/UX. Ingen backend- eller CI-endringer. Patcher er små og enkle å reverte.

**TODO (@dev)**
- Eksponere `/core/undo` med `undoToken` for ekte tilbakeføring + audit.