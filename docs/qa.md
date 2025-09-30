# QA playbook

Dette dokumentet samler de viktigste QA-kommandoene for Workbuoy Suite og hva de rapporterer i CI.

## Accessibility sweep (frontend)

```bash
npm run qa:a11y -w @workbuoy/frontend
```

- Kjører Vitest med axe-core mot `/dashboard` og `/dock-demo`.
- Lokalt gir kommandoen detaljerte feil i terminalen.
- I GitHub Actions skriver reporterne funn (eller "0 violations") til `$GITHUB_STEP_SUMMARY` slik at resultatet vises i jobbsammendraget.

## Contract tests (backend)

```bash
npm run test:contract -w @workbuoy/backend
```

- Starter backend-serveren in-memory og verifiserer `GET /api/version` og `GET /metrics` mot forventede headere og skjema.
- Testene forventer `content-type: application/json; charset=utf-8` for `/api/version` og `text/plain; version=0.0.4; charset=utf-8` for `/metrics`, samt `service`/`version`-labels i Prometheus-utskriften.
- I CI blir eventuelle avvik logget i `$GITHUB_STEP_SUMMARY` sammen med en kort beskrivelse per endpoint.

## Når kjøres de i CI?

- `qa:a11y` er koblet inn som valgfritt steg i frontend-pipeline og release-workflowen.
- `test:contract` kjøres i backend-pipeline og release-workflowen for å fange regresjoner før tagger publiseres.
