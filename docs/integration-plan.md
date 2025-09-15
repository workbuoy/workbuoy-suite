# Backend Wiring Plan (UI → Server) — PR-25

**Mål:** UI kaller ekte backend-endepunkter når klart, uten å endre UX. Alt bak feature flag `Flags.realBackend`.

## Headere (allerede sendt via PR-17)
- `X-WB-Intent`, `X-WB-When`, `X-WB-Autonomy`, `X-WB-Selected-Id`, `X-WB-Selected-Type`

## Endepunktkart
- `GET /api/addons` → `useEndpoints().listAddons()`
- `GET /api/crm/contacts` → `useEndpoints().listContacts()`
- `POST /api/crm/contacts` → `useEndpoints().createContact(data)`
- `DELETE /api/crm/contacts/:id` → `useEndpoints().deleteContact(id)`
- `POST /core/complete` → `useEndpoints().buoyComplete({ text, intent, whenISO? })`
- `POST /core/undo` → `useEndpoints().undoPerform(token)`

## Aktivering
Sett `Flags.realBackend = true` når server er klar.

## TODO (@dev)
- Implementer `/core/complete` og `/core/undo` (aksepter `X-WB-*` headere).
- CRM-ruter: returner `explanations[]` ved 403.
- Audit logg: logg `X-WB-*` + respons (for WhyDrawer).