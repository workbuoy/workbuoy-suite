# Workbuoy Suite — Remaining 20% of MVP (Drop-in)

This bundle contains:
- `src/core/auditVerify.ts` + tests
- Event bus retry/DLQ tests
- CRM policy enforcement test + patch guide
- Lint-friendly `openapi/openapi.yaml`
- Coverage gate instructions + optional coverage workflow
- Cypress UI smoke tests (optional)
- Updated `docs/STATUS.md`

## Branch & apply
```
git checkout -b feat/mvp-remaining-20
# unzip contents into repo root, then:
git add .
git commit -m "feat(mvp): remaining 20% — audit verify, bus tests, CRM policy tests, openapi, coverage, cypress"
git push -u origin feat/mvp-remaining-20
```

## Make tests pass
1) **CRM policy guard**
   - Follow `PATCHES/CRM_POLICY.md` and apply `policyGuard` to CRM POST/DELETE.
   - Run `npm test -- --runTestsByPath tests/crm.policy.test.ts`.

2) **Coverage gate**
   - Follow `PATCHES/PACKAGE_COVERAGE.md` and push.

3) **OpenAPI lint**
   - Replace `openapi/openapi.yaml` with the one provided (already lint-friendly).
   - Ensure the lint workflow runs green.

## Suggested PR title
```
feat(mvp): remaining 20% — audit verify, event-bus tests, CRM policy, openapi lint, coverage, cypress
```
