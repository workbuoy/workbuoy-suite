# feat(ux): Enable backend + bind SmartUndo to /core/undo (PR-31)

**Hva**
- Setter `realBackend=true` i `Flags`.
- `SmartUndo.addAction(action, performOverride?)` lar UI kople angre-forslag til serverkall.
- `ContactsPanel` leser `undoToken` fra respons (body eller `x-undo-token`) og kobler `perform()` → `/core/undo`.
- `docs/ui_undo_integration.md` forklarer mønsteret og fallback.

**Hvorfor**
- Gjør “Angre” virkelig — ikke bare en UI-stub — samtidig som vi bevarer kompatibilitet.

**Hvordan teste**
- Opprett/slett kontakt → se undo-chip.
- Hvis backend utsteder `undoToken`, klikk “Angre” → `/core/undo` kalles (Network). Chip forsvinner ved `{ ok:true }`.
- Uten token → chip fungerer fortsatt (lokal fjerning).

**Risiko/rollback**
- Små patcher. Sett `realBackend=false` om nødvendig.