# Mini Final — Steps 1–5 (Hardening deltas)

Denne pakken inneholder KUN de målrettede endringene:

1) **Rate-limit wiring** på alle write-ruter (CRM/Tasks/Log).  
2) **AppError-bruk** i controllere + patch for `src/server.ts` (errorMapper til slutt).  
3) **Policy guard** som returnerer `explanations[].sources[]` ved 403.  
4) **DB flag wiring** for Tasks (samme mønster kan kopieres til CRM/Log).  
5) **Prisma migrasjon** (valgfri): index på `tasks.status`.

## Bruk
```bash
git checkout -b feat/mini-final-hardening
# pakk ut innholdet i repo-roten
git add .
git commit -m "feat(hardening): rate-limit wiring, AppError usage, policy sources, DB flag in tasks, optional task status index"
git push -u origin feat/mini-final-hardening
```

### Server error mapper (patch)
Se `PATCHES/HARDEN_server_errorMapper.diff` og legg til linjene i `src/server.ts` (siste middleware).

### Tester
```
npm test -- --runTestsByPath tests/api/rate-limit.test.ts
```

### Miljø
```
RATE_WINDOW_MS=60000
RATE_MAX=100
DB_ENABLED=false   # sett true når repo-laget er klart
```

> NB: Hvis dere allerede har egne versjoner av filene, flett diffene manuelt for å unngå overlapp.
