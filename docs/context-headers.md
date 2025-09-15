# Context → Server Headers (PR-17)

**Mål:** La frontend sende lettvekts kontekst til backend *uten* å kreve kontraktsendringer i payloads.

## Oversikt
Vi introduserer en liten fetch-wrapper `useApi().withContext(...)` som injiserer HTTP-headere:
- `X-WB-Intent`: f.eks. `contacts.create`
- `X-WB-When`: ISO `YYYY-MM-DDTHH:MM` (fra morphing input `:: when=`)
- `X-WB-Autonomy`: policy-nivå (0..5) — valgfritt, kan kobles til ModeSwitch
- `X-WB-Selected-Id` / `X-WB-Selected-Type`: fra `ActiveContext.selectedEntity`

## Bruk
```ts
const { withContext } = useApi();
await withContext('/api/crm/contacts', { method:'POST', body: JSON.stringify(form) }, {
  intent: 'contacts.create',
  whenISO: '2025-10-12T14:00'
});
```

## Hva endres i denne PR-en
- `ContactsPanel` og `NaviGrid` bruker wrapperen for GET/POST/DELETE.
- `useBuoy` viser et kommentert eksempel for `/core/complete` (ikke aktivert).

## TODO (Dev)
- Parse og logg headere i backend for policy, audit og forklarbarhet.
- Eventuelt returnere `explanations[]` justert på bakgrunn av mottatt kontekst.