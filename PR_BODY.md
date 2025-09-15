# feat(backend): /core/undo + undoToken store (PR-30)

**Hva**
- `/core/undo` endepunkt.
- In-memory token store + `registerUndo` helper.

**Hvordan teste**
- Utsted `token` manuelt i en write-rute og kall `/core/undo` med den → `{ ok:true }`.

**Risiko/rollback**
- Isolert rute. Fjern mount for rollback.