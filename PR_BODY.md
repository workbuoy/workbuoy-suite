# test(ux): E2E UI smoke (Playwright/Vitest) – PR-9

**Hva**
- Legger til Playwright-konfig (`frontend/playwright.config.ts`) som starter Vite-devserver automatisk.
- En minimal smoke-test `frontend/e2e/smoke.spec.ts`: last app → flip til Navi → åpne Kontakter → legg til kontakt → verifiser.
- Dokumentasjon `docs/ops/ci.md` for lokal kjøring og hvordan Dev aktiverer dette i CI.

**Hvorfor**
- Sikre at frontend-skjelettet og de viktigste brukerflytene fungerer fra ende til ende.

**Hvordan teste lokalt**
```bash
cd frontend
npm i -D @playwright/test
npx playwright install --with-deps
npx playwright test
```

**Risiko/rollback**
- Kun test + docs. Påvirker ikke prod-kode. Enkel å reverte.

**TODO (@dev)**
- Legge inn `npx playwright install --with-deps` og `npx playwright test` i CI-workflow.