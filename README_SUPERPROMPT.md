# Workbuoy Superdrop v1 — One-shot bundle

This bundle lets you finish and harden the MVP in one PR without guessing your existing file contents.

## Apply (one branch, one PR)

```bash
git checkout -b feat/superdrop-mvp-v1
# unzip contents into repo root
git add .
git commit -m "feat(mvp): superdrop v1 — audit verify, event-bus tests, CRM policy guard, openapi lint, coverage, docs"
git push -u origin feat/superdrop-mvp-v1
```

## Make it pass

1) **CRM policy guard**  
   Open `PATCHES/CRM_POLICY.md`, add `policyGuard` on CRM POST/DELETE, then:
   ```bash
   npm test -- --runTestsByPath tests/crm.policy.test.ts
   ```

2) **OpenAPI lint**  
   This drop ships a lint-friendly `openapi/openapi.yaml`. Ensure the `openapi-lint` workflow runs green.

3) **Coverage gate ≥80%**  
   Follow `PATCHES/PACKAGE_COVERAGE.md`. Add `npm run coverage` step to backend-ci.

4) **Run full suite**
   ```bash
   npm ci
   npm run typecheck
   npm run lint
   npm test
   npm run coverage
   ```

## Suggested PR title

```
feat(mvp): superdrop v1 — audit verify, event-bus tests, CRM policy guard, openapi lint, coverage, docs
```

## After merge
- Make **openapi-lint** and **coverage ≥80%** *required* checks in branch protection after a couple of green runs.
- Tag `v2.0.0` when ready.
