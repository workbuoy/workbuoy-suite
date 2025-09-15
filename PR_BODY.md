# feat(ux): Temporal Layering (PR-21)

**Hva**
- `TemporalLayering`-komponent: Fortid / Nå / Fremtid på samme flate.
- Patch for `NaviGrid` for å åpne `timeline`-panelet.

**Hvorfor**
- Hurtig bytte av tidsperspektiv uten ny navigasjon.

**Hvordan teste**
- Åpne Navi → timeline (demo).
- Bruk musescroll (opp/ned) eller **PageUp/Down** og **Home**.

**Risiko/rollback**
- Kun frontend + docs.