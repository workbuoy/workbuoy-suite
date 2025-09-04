# PR-1: DX basics – TypeScript + Jest + CI

## Mål
Stabilisere utvikleropplevelsen (DX) slik at `backend-ci` går grønt på hver PR.

## Endringer
- TypeScript strict + `tsc --noEmit` (typecheck i CI)
- Jest konfigurert via `ts-jest` (Node testEnvironment)
- GitHub Actions: install → typecheck → test
- Dokumentasjon: oppdaterte `docs/STATUS.md` og `docs/ops/ci.md`

## Hva inngår ikke
- Ingen runtime-endringer
- Ingen ESLint/Prettier (kommer senere)

## Sjekkliste
- [ ] CI kjører grønt (typecheck + test)
- [ ] 1 approval (ruleset)
- [ ] Label `automerge` satt

## Notater (monorepo)
Hvis backend ligger i `backend/`, flytt disse filene dit og sett i workflow:
```yaml
defaults:
  run:
    working-directory: backend
with:
  cache-dependency-path: backend/package-lock.json
```
