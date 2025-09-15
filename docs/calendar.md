# Morphing Input — Dato/Kalender (PR-15)

**Mål:** Oppdag naturlig språk for tid/dato og tilby inline velger.

## Støttede uttrykk
- `tor 14:00`, `thu 14`
- `i morgen 09`, `tomorrow 9`
- `12.10` eller `12/10` (+ valgfri tid)

Når det gjenkjennes vises en chip. Klikk → `InlineDateTimePicker` (native inputs). Ved OK enriches teksten med `:: when=YYYY-MM-DDTHH:MM`.

## Videre
- Map `:: when=` til strukturert intent i `/core/complete`.
- Flere språk/format.