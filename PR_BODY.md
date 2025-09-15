# feat(ux): Context → Server Headers (PR-17)

**Hva**
- Ny `useApi().withContext` fetch-wrapper som injiserer headere:
  - `X-WB-Intent`, `X-WB-When`, `X-WB-Autonomy`, `X-WB-Selected-{Id,Type}`.
- Oppdatert `ContactsPanel` og `NaviGrid` til å bruke wrapperen.
- Kommentar i `useBuoy` som viser hvordan `/core/complete` kan bruke samme mønster.
- Dokumentasjon i `docs/context-headers.md`.

**Hvorfor**
- Gjør det enkelt for backend å forstå *hva* brukeren prøver å gjøre, *når*, og i hvilken *kontekst* — uten å låse payload-kontrakter.

**Hvordan teste**
- Åpne DevTools → Network. Se at kall til `/api/addons` og `/api/crm/contacts` har `X-WB-*` headere.
- Opprett/slett kontakt: verifiser at `X-WB-Intent` endres (create/delete).

**Risiko/rollback**
- Kun frontend + docs. Ingen backend/CI-endringer. Lett å reverte.

**TODO (@dev)**
- Parse `X-WB-*` headere i serveren for policy/audit/why.