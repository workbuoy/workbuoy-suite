# E2E UI smoke (Playwright) — PR-9

Denne testen starter `frontend` via Vite og kjører en enkel flyt:
1) Last app (`/`)
2) Flip til **Navi**
3) Åpne **Kontakter**
4) Legg til kontakt (**Test Person**)
5) Verifiser at navnet vises

## Lokal kjøring

Installer Playwright hvis ikke allerede gjort:
```bash
cd frontend
npm i -D @playwright/test
npx playwright install --with-deps
```

Kjør testene (webServer starter dev-server automatisk på :5173):
```bash
npx playwright test
```

Kjør med UI:
```bash
npx playwright test --ui
```

## CI (TODO for Dev)
- Legg til Playwright i CI med `npx playwright install --with-deps`.
- Bruk `npx playwright test` i workflow etter build.
- Sørg for at `frontend` er arbeidskatalog.
- Nettverkskall er mocket i UI; ingen eksterne avhengigheter forventet.

> **Merk:** Ingen workflows endres i denne PR-en. Dette dokumentet beskriver hva Dev må gjøre for å aktivere E2E i CI.