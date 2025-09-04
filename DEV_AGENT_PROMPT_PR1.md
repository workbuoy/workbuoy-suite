**Oppgave:** Fullfør PR-1 (DX basics) for Workbuoy Suite.

**Akseptansekriterier:**
1) `backend-ci` workflow kjører `install → typecheck → test` og blir grønn.
2) TypeScript strengt oppsatt (`tsc --noEmit`).
3) Jest fungerer mot TS med `ts-jest`.
4) Ingen runtime-endringer, kun DX/CI.
5) `docs/STATUS.md` oppdatert med PR-1-seksjon.

**Gjør dette:**
- Bruk branch `chore/dx-basics-pr1`.
- Sikre `package.json` scripts: `typecheck`, `test`, `build`.
- Konfigurer `tsconfig.json` og `jest.config.cjs` som i PR-beskrivelsen.
- Oppdater `.github/workflows/backend-ci.yml` til å kjøre Node 20, npm cache, `npm ci`, typecheck og test.
- Når CI er grønn, sett `automerge`-label og ping for 1 approval.

**Begrensninger:** Små commits, ingen prod-kode endringer, ikke innfør ESLint enda.
**Artifacts:** Skjermbilder/lenker til grønn workflow-kjøring.
