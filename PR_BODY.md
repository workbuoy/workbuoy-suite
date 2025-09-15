# chore(ux): Polish + README + demo-snutter (PR-12)

**Hva**
- Oppdatert `README.md` (konsept, kom-i-gang, lenker til docs).
- Ny `docs/frontend.md` (dev-guide: scripts, mocks, tips).
- Demo-SVGs i `assets/demo/` for PR-beskrivelser og repo-landing (`flip.svg`, `why.svg`, `crm.svg`).

**Hvorfor**
- Rask “wow” for nye som åpner repoet. Demo-vennlig og lett å sette opp.

**Hvordan teste**
- Åpne `README.md` og klikk `assets/demo/*.svg` i GitHub.
- `cd frontend && npm run dev` for å starte appen som før.

**Risiko/rollback**
- Kun docs og assets. Ingen backend/CI-endringer. Enkel å reverte.

**TODO (@dev)**
- (Valgfritt) Generere GIF/PNG automatisk i CI fra Playwright-videoer i en senere PR.