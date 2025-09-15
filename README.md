# Workbuoy — Buoy AI + Navi (UX Shell)

**Workbuoy** er en AI-first arbeidsplattform:  
- **Buoy AI** (forside): samtalebasert assistent med forklarbarhet (“Vis hvorfor”).  
- **Navi** (bakside): visuell oversikt over add-ons (CRM, ERP, e-post, filer) og kontekst.

Frontend-skallet (FlipCard) og UX-komponentene som danner grunnmuren:
- Flip-kort: Buoy ↔ Navi
- BuoyChat: meldingsschema, micro-visualiseringer, “Vis hvorfor”
- NaviGrid: manifest → tiles → paneler (CRM “Kontakter” som MVP)
- Autonomi-moduser: Passiv / Proaktiv / Ambisiøs / Kraken
- A11y/tema tokens + responsive fallback
- E2E-smoke (Playwright)

> **Bestemor-vennlig UX**: store treffflater, én primærhandling, tydelig hierarki, norsk tekst.

## Kom i gang (frontend)
```bash
cd frontend
npm install
npm run dev
# åpne http://localhost:5173
```

**Mocks:** UI bruker mockede `fetch`-endepunkter i utvikling. Ingen eksterne systemer trengs.

## Demo-snutter
Se `assets/demo/` for SVG-illustrasjoner:
- `flip.svg` — FlipCard (Buoy ↔ Navi)
- `why.svg` — “Vis hvorfor” i Buoy
- `crm.svg` — CRM “Kontakter” + round-trip chip

## Videre lesning
- `docs/ux.md` — UX-visjon og flip-kortprinsipper  
- `docs/buoy.md` — meldingsschema + gradert autonomi  
- `docs/navi.md` — moduser og UI-policy  
- `docs/addons/crm.md` — CRM cockpit & round-trip  
- `docs/ux.predictive.md` — Predictive Loading & skeletons  
- `docs/frontend.md` — utviklerguide (scripts, mocktips)

## Status
- UX Vision v1: ✅  
- PR-1 → PR-11: ✅  
- Denne PR-12: README + demo + frontend-dok.

## Lisens
© Workbuoy. Med forbehold. Se LICENSE hvis den legges til.