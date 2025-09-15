# PR2 — Consolidate feature routers + policy on writes + e2e for Tasks/Log

## Innhold
- Oppdatert `src/features/tasks/routes.ts` (riktig create-payload, policy på writes).
- Nye tester:
  - `tests/features/tasks.e2e.test.ts`
  - `tests/features/log.e2e.test.ts`

## Hva du får
- Verifisert policyV2-guard på **alle** write-ruter (403 → `explanations[]`).
- Røyk for Tasks/Log: GET + POST/CRUD med autonomy 1 vs 4.

## Neste steg
- Fjern/marker eventuelle legacy-duplikater av rutefiler i repoet (om noen ligger igjen fra tidligere).
- Når disse testene er grønne, kan vi gå videre til PR3 (OpenAPI + lint).
