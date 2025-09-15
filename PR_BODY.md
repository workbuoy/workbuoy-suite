
# feat(ux): Morphing Input – Dato/Kalender (PR-15)

**Hva**
- `parseNaturalDate` for enkle dag/tid-formater (nb/en).
- `InlineDateTimePicker` (native date/time).
- Patch for `MorphInput` som viser chip → inline picker → enrich tekst med `:: when=`.
- `docs/calendar.md`.

**Hvorfor**
- Tidsstyrte handlinger uten tunge dialoger. Naturlig og raskt.

**Hvordan teste**
- Skriv `tor 14:00` eller `i morgen 09` → chip → velg → tekst berikes.
- Også `thu 14` og `12.10 09`.

**Risiko/rollback**
- Kun frontend + docs.

**TODO (@dev)**
- Knytte `:: when=` til faktisk intent payload i backend.
