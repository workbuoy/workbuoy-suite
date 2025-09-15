# chore(ux): A11y, responsivitet og tema (PR-8)

**Hva**
- Ny `styles/tokens.css` med tema-variabler, fokusringer og responsive tokens.
- FlipCard: tastatur-flip (Space/Enter), rolle/ARIA, mobil-fallback (ingen 3D).
- NaviGrid: `role="region"` + mer ARIA på paneler.
- Docs: A11y-prinsipper lagt til (`docs/ux.md` addendum).

**Hvorfor**
- Sikre WCAG-vennlig navigasjon, bedre kontrast og brukbarhet uten mus.
- Gjøre UI robust på mobil og ved redusert bevegelse.

**Hvordan teste**
- `cd frontend && npm run dev`
- Tab til flip-kort → Space/Enter flipper.
- Sjekk `aria-live` i chat (nye meldinger dukker opp).
- Smal skjerm: 3D-rotasjon slås av; layout flyter vertikalt.

**Risiko/rollback**
- Kun frontend + docs. Endringer via små patcher. Enkelt å rulle tilbake.

**TODO (@dev)**
- Valgfritt: koble `prefers-color-scheme`/tema-innstillinger via user settings.