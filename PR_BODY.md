# feat(ux): Emotional State Inference – UI-stub (PR-22)

**Hva**
- `useTypingAffect` hook (cadence/backspace-rate).
- `AffectStyles` injiserer CSS-variabler for knappestørrelse/treffflate.
- Patch for `MorphInput` (bruker hook + styles).

**Hvorfor**
- Tilpasser UI til brukerens tempo/tilstand → mer forgiving.

**Hvordan teste**
- Skriv veldig raskt og trykk Backspace flere ganger → knapper “puster” litt større.
- Rolig skriving → normal størrelse.

**Risiko/rollback**
- Kun frontend. Ingenting lagres eller sendes.