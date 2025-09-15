# Undo Polish (PR-18) — ikon, tidsutløp, Esc

**Hva**
- Auto-timeout (default 15s) på undo-forslag.
- Esc-tast utfører siste (nyeste) forslag.
- Undo-chips har ikon, sekundnedtelling, og egne knapper: **Angre** / **? (Why)**.

**Hvorfor**
- Senker kognitiv last: brukeren trenger ikke huske å rydde opp.
- Tastatursnarvei gir fart; nedtelling gjør at UI ikke gror igjen.

**Videre**
- “Grace period” etter perform (tilbakestill-undo).
- Risiko-score → lengre TTL og mer prominent stil for høy risiko.