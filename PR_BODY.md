# feat(ux): CRM MVP UI (Kontakter + round-trip stub)

**Hva**
- `ContactsPanel` (liste, søk, legg til kontakt, “Åpne i Buoy”).
- `ActionBar` (Forhåndsvis → Utfør → kvittering med “Vis i CRM”).
- `SynchBadge` i Navi, og `NaviGrid` åpner CRM-panelet.
- `types.ts` utvidet (ActionProposal/Result).
- Mock-API: `GET/POST /api/crm/contacts`, `POST /core/actions/commit`.
- `docs/addons/crm.md` beskriver cockpit-flow + round-trip.

**Hvorfor**
- Cockpit over eksisterende CRM — hent, hjelp, lever tilbake der data hører hjemme.

**Hvordan teste**
- `cd frontend && npm run dev`
- Flip til Navi → trykk **Kontakter** → se liste, søk, legg til.
- På en kontakt: “Åpne i Buoy” (stub), og bruk **Forhåndsvis/Utfør** → kvittering + “Vis i CRM”.

**Risiko/rollback**
- Kun frontend + docs. Ingen backend/CI-endringer. Trygt å reverte.

**TODO (@dev)**
- Ekte `/core/actions/commit` med idempotency + audit logg.
- Koble til faktisk CRM-connector (HubSpot/SFDC/SO/Dynamics).