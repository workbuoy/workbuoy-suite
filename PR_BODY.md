# chore(ux): Undo polish — ikon, timeout, Esc (PR-18)

**Hva**
- `SmartUndo`: TTL på forslag + Esc-shortcut + `performNow`.
- `UndoChips`: ikon, nedtelling, egne knapper (Angre/Why).
- `docs/undo.polish.md`: beskriver endringen.

**Hvorfor**
- Mer trygg og effektiv “angre”-opplevelse.

**Hvordan teste**
- Opprett/slett kontakt → se chips med nedtelling.
- Trykk **Esc** → siste forslag utføres (forventet: forsvinner).
- Klikk **?** → WhyDrawer åpnes.

**Risiko/rollback**
- Kun frontend/UX. Små patcher.

**TODO (@dev)**
- Koble `perform()` til `/core/undo` når tilgjengelig.