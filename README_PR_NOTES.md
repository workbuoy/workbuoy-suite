# Patch PR: Fix backend-ci test split + OpenAPI lint sandbox issue

This PR bundle fixes two issues blocking CI:

1. **backend-ci**: In-memory tests should run with `FF_PERSISTENCE=false`, DB tests with `FF_PERSISTENCE=true`.  
   - Updated workflow splits jobs.  
   - Test files (`active.api.test.ts`, `usage.api.test.ts`) skip automatically if `FF_PERSISTENCE=true`.

2. **openapi-lint**: Puppeteer "No usable sandbox!" in GH Actions.  
   - Added `PUPPETEER_ARGS=--no-sandbox` env var to workflow.

## Apply
```bash
git checkout -b fix/ci-openapi
# Unpack zip in repo root
git add .github/workflows backend/tests/features/active.api.test.ts backend/tests/usage/usage.api.test.ts
git commit -m "ci: split in-memory vs db tests; fix openapi lint sandbox"
git push -u origin fix/ci-openapi
```
