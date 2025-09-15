# feat(ux): Morphing Input + Conversational Commands (PR-10)

**Hva**
- Ny komponent `MorphInput` med:
  - @kontakt-forslag (fra `/api/crm/contacts`)
  - =kalkulator (evaluerer enkle uttrykk lokalt)
  - dato/klokkeslett-hint (kalender kommer senere)
- Parser `commandParser.ts` som gjenkjenner 5+ kommando-mønstre.
- `BuoyChat` bytter til `MorphInput` og sender `intent` videre til `useBuoy`.
- `useBuoy` aksepterer valgfri `intent` og viser en bekreftelse i stub-svaret.
- `docs/commands.md` beskriver mønstre og atferd.

**Hvorfor**
- Én, intelligent inngang gjør Workbuoy rask og naturlig å bruke — uten menyjakt.

**Hvordan teste**
- `cd frontend && npm run dev`
- Skriv `show me tasks from last week` → assistentsvar viser forstått intent.
- Skriv `@ol` → kontaktforslag dukker opp.
- Skriv `=34+8*2` → inline resultatchip.
- Skriv `thu 14:00` → vises som dato-hint (kalender kommer senere).

**Risiko/rollback**
- Kun frontend + docs. Ingen endring i backend/CI. Enkel å reverte.

**TODO (@dev)**
- `/core/complete` kan konsumere `intent`-objektet for ekte handlinger senere.