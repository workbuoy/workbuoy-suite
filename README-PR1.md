# Workbuoy Suite – PR-1 bundle (DX basics)

**Bruk:**

1. Sjekk ut ny branch:
   ```bash
   git switch -c chore/dx-basics-pr1
   ```
2. Pakk ut *innholdet av denne zip-en* i repo-roten (eller i `backend/` hvis backend ligger der).
3. (Valgfritt monorepo) Hvis filer legges i `backend/`, åpne `.github/workflows/backend-ci.yml` og sett `defaults.run.working-directory: backend` og `cache-dependency-path: backend/package-lock.json`.
4. Installer dev-avhengigheter og kjør lokalt:
   ```bash
   npm i -D typescript@5.5 ts-node@10 @types/node@20 jest@29 ts-jest@29 @types/jest@29
   npm run typecheck && npm test
   ```
5. Commit og push:
   ```bash
   git add -A
   git commit -m "chore(dx): stabilize TypeScript & Jest, add CI steps (PR-1)"
   git push -u origin chore/dx-basics-pr1
   ```
6. Opprett Pull Request mot `main`, legg på label **`automerge`** og be om 1 approval.

**Innhold:** `package.json`, `tsconfig.json`, `jest.config.cjs`, `.github/workflows/backend-ci.yml`, `docs/STATUS.md`, `docs/ops/ci.md`, `PR_BODY_PR1.md`.

**Merk:** Ingen runtime-endringer. Dette er kun DX/CI-stabilisering.
