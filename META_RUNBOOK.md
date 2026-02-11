# META Runbook (Safe / Opt-in)

Denne runbooken beskriver hvordan du bruker repoets META-modus på en sikker, avgrenset måte.

## Formål
`npm run meta` kjører lokal statisk analyse og genererer en prioritert backlog av forbedringsarbeid.

- Skanner etter TODO/FIXME/HACK/XXX-markører.
- Oppdager duplikate konfigurasjonsmønstre (`package.json`, `tsconfig*.json`, `.env.example`, `docker-compose.yml`).
- Skriver rapporter til `meta/reports/`.

## Sikkerhetsgrenser
- Verktøyet er **opt-in**: det kjører kun når en utvikler eksplisitt starter kommandoen.
- Verktøyet leser kun filer lokalt i repoet.
- Verktøyet gjør ingen nettverkskall.
- Verktøyet eksporterer ikke miljøvariabler eller hemmeligheter.
- Verktøyet applicerer ikke patcher automatisk.

## Bruk
```bash
npm run meta
npm run meta -- --suggest
```

Output:
- `meta/reports/meta-backlog.md`
- `meta/reports/meta-backlog.json`
- `meta/reports/meta-patch-suggestions.json` (kun med `--suggest`)

## Arbeidsflyt
1. Kjør `npm run meta`.
2. Velg P1/P2-punkter i backloggen.
3. Opprett små PR-er med testbare endringer.
4. Ved `--suggest`: bruk forslagene som utgangspunkt, men review manuelt før commit.

## Policy
- Ingen auto-merge fra META-output alene.
- Alle patcher må passere lint/typecheck/test i CI.
