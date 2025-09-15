# feat(ux): Triggers & Suggestions (PR-14)

**Hva**
- Ny `useTriggerEngine` hook som legger til forslag basert på ActiveContext.
- Utvidet `useBuoy` med `suggestions` + `addSuggestion`.
- `BuoyChat` rendrer forslag som chips; klikker åpner WhyDrawer.
- Dokumentasjon i `docs/triggers.md`.

**Hvorfor**
- Første skritt mot proaktive forslag i Workbuoy. Gjør at Buoy føles mer initiativrik, men alltid med forklarbarhet.

**Hvordan teste**
- `npm run dev` i `frontend`.
- Åpne Navi → Kontakter (trigges `contacts.view`).
- Sørg for at `recentIntents` inkluderer `crm`/`invoice` → “Send purring”-chip vises i BuoyChat.
- Klikk chip → WhyDrawer åpnes med forklaring.

**Risiko/rollback**
- Kun UI/UX. Ingen backend- eller CI-endringer.

**TODO (@dev)**
- Koble triggers til ekte backend-events.