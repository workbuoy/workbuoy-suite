# UI ↔ Backend: Undo-integrasjon (PR-31)

**Hva**
- Slår på `realBackend=true` i `Flags`.
- SmartUndo støtter `performOverride` slik at UI kan kalle `/core/undo` når backend utsteder `undoToken`.
- ContactsPanel:
  - `POST /api/crm/contacts` leser `undoToken` fra body (`{ undoToken }`) **eller** header `x-undo-token`.
  - `DELETE /api/crm/contacts/:id` leser `x-undo-token` hvis satt.
  - Registrerer Undo-chip med `perform()` som kaller `useEndpoints().undoPerform(token)`.

**Backwards compatible**
- Hvis backend ikke gir token, fungerer lokal-undo som før (chip uten server-kall).

**Neste for backend**
- Returnér `undoToken` ved create/delete (enten i JSON eller som `x-undo-token`).
- `/core/undo` validerer token og gjør om handlingen (MVP: ok=true).