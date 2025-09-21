# CI Notes

This repository has three relevant backend/OpenAPI workflows. Run the same commands locally to debug failing checks.

## Backend smoke tests (in-memory)
- Workflow: `.github/workflows/backend-ci.yml`
- Command:
  ```bash
  cd backend
  FF_PERSISTENCE=false npm test -- \
    tests/features/active.api.test.ts \
    tests/usage/usage.api.test.ts \
    --runInBand --passWithNoTests
  ```
- Jest config: `backend/jest.meta.config.cjs` (loads policy/meta/usage tests and skips DB suites when `FF_PERSISTENCE=false`).
- Tip: keep `FF_PERSISTENCE=false` so the in-memory fallback is used. Gate any DB-only tests or modules behind a `FF_PERSISTENCE==='true'` check.

## Type checking
- Workflow runs `npm run typecheck --if-present` from repo root.
- Local command:
  ```bash
  npm run typecheck
  ```
- Config: `tsconfig.meta.json` extends the shared TypeScript config.

## OpenAPI lint (Redocly)
- Workflow: `.github/workflows/openapi-lint.yml`
- Command (latest Redocly CLI):
  ```bash
  npx @redocly/cli lint openapi/**/*.yaml
  ```
  (The CI job iterates each file under `openapi/` individually.)
- Ensure every documented operation has an `operationId`, valid responses, and no broken `$ref` paths.

## Running persistence-backed tests
- To execute the Postgres-backed suites locally, start Postgres and set the flag before invoking Jest:
  ```bash
  cd backend
  FF_PERSISTENCE=true npm test
  ```
- The Prisma client is loaded lazily; modules only touch the database when the feature flag is `true` at runtime.
