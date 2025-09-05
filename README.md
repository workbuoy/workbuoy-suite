# WorkBuoy Suite


## Release Orchestrate (GitHub Actions)
Se `.github/workflows/release-orchestrate.yml`. Kjør via Actions → workbuoy-release-orchestrate med inputs `modules` og `environment`.


## CI Templates
- GitLab CI: `.gitlab-ci.yml`
- Azure DevOps: `azure-pipelines.yml`

## UX-visjon (kortversjon)

WorkBuoy bygges som en nordisk, AI-først kontorplattform hvor to kjernekomponenter danner grunnmuren:

- **Buoy AI (forside):** Samtalebasert, forklarbar assistent som foreslår og utfører handlinger på tvers av systemer. Chatten viser forslag, utkast og mikro-visualiseringer som sparklines og mini-bars for rask innsikt. En egen “Vis hvorfor”-knapp forklarer anbefalinger og kilde.
- **Navi (bakside):** Visuell oversikt over add-ons som e‑post, CRM, ERP og analyse. Brukeren kan bla til denne siden for å finne verktøy og styre autonomi-nivået (0–2). Baksiden har store treffflater og enkel navigasjon.

Ved å klikke eller bruke tastatur (Enter/Space) flipper brukeren kortet mellom Buoy og Navi. Designet er bestemor‑vennlig med stor typografi, tydelig hierarki og norske tekster. Tilgjengelighet er prioritert gjennom ARIA-attributter, tastaturnavigasjon, kontrast og fokusring.

Se docs/ux.md for detaljert dokumentasjon om konsepter, prinsipper, mikro-visualiseringer og universell utforming.
