# feat(ux): Navi-moduser i UI (autonomi)

**Hva**
- `AutonomyProvider` (context) og `POLICY`-mapping for UI.
- `ModeSwitch`-komponent (Passiv/Proaktiv/Ambisiøs/Kraken).
- `FlipCard` patched for å vise `ModeSwitch` og wrappe med `AutonomyProvider`.
- `BuoyChat` patched: viser gjeldende modus og skjuler/viser actions iht. policy.
- `docs/navi.md` dokumenterer moduser og UI-policy.

**Hvorfor**
Brukeren skal styre hvor aktiv Buoy er. UI speiler nivået uten å ta over backend-policy.

**Hvordan teste**
- `cd frontend && npm run dev`
- Bytt modus via kontrollen i headeren.
- Skriv i Buoy → se at actions vises/skjules basert på valgt modus.

**Risiko/rollback**
- Kun frontend + docs. Patch for `FlipCard` og `BuoyChat` er små og kan reverseres.

**TODO (@dev)**
- Koble UI-modus til faktisk policy i backend (headers/context).
- Logg modusskifte (audit).