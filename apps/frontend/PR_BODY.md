# feat(ux): frontend shell (FlipCard + BuoyChat + NaviGrid + micro-viz)

**Hva**
- Oppretter `frontend/` (Vite/React) med FlipCard-shell, BuoyChat (chat + “Vis hvorfor” + mikro-viz),
  NaviGrid (elegante add-on tiles), health-badge (/api/health mock).

**Hvorfor**
- Chat som primærflaten (Buoy). Navi visualiserer jobbflaten og add-ons – diskret, moderne UI.

**Hvordan teste**
- `cd frontend && npm i && npm run dev`
- Space/Enter for flip. Skriv i chat → se svar + sparkline/mini-bar.
- Navi viser add-ons fra mock `/api/addons`.

**Risiko/rollback**
- Kun ny mappe `frontend/`. Berører ikke backend/CI. Sikker å reverte.

**TODO (@dev)**
- Koble Buoy til ekte API (PR-6).
- Manifest-endepunkt i backend (PR-4).
- E2E smoke når frontend-CI legges til.