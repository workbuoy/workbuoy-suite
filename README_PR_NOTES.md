# Patch PR: Fix double `/api` in routers + OpenAPI, export app safely, and add minimal tests

This PR bundle helps you quickly fix the "double /api" issue and get CI green.

## What this includes
1) **Router path fix script** — removes hardcoded `/api` inside `backend/routes/features.ts` and `backend/routes/usage.ts`.
2) **OpenAPI path fix script** — rewrites any `/api/api/` occurrences to `/api/` in your OpenAPI spec files.
3) **Minimal API tests** — verify `/api/features/active` and `/api/usage/*` work.
4) **Server export note** — ensure `src/server.ts` exports the Express app without calling `listen()` when imported (so Supertest can use it).

## How to apply
```bash
git checkout -b fix/api-paths-and-spec
node scripts/apply-router-path-fix.mjs
node scripts/apply-openapi-path-fix.mjs

# Run tests in in-memory mode (no Postgres needed)
FF_PERSISTENCE=false npm test

git add backend/routes/features.ts backend/routes/usage.ts scripts/*.mjs tests/features/active.api.test.ts tests/usage/usage.api.test.ts
git commit -m "fix(api): remove double /api in routers; fix OpenAPI paths; add minimal endpoint tests"
git push -u origin fix/api-paths-and-spec
```
If any test still fails, ensure `src/server.ts` **exports** the app without listening:
```ts
// At the bottom of src/server.ts
export default app;
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on ${port}`));
}
```
