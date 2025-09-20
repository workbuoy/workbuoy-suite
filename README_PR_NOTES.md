# Patch PR: Fix double `/api` (features & usage routers) + minimal tests

This patch prevents endpoints from being published at `/api/api/...` by removing the
hardcoded `/api` prefix **inside** the routers (they are already mounted under `/api` in the server).

## What this does
- In `backend/routes/features.ts`, converts paths from `/api/features/*` → `/features/*`.
- In `backend/routes/usage.ts`, converts paths from `/api/usage/*` → `/usage/*`.
- Adds minimal tests to assert the public endpoints: `/api/features/active` and `/api/usage/*`.
- Leaves server mounting as `app.use('/api', router)` (unchanged).

## Safe application
Use the provided script to do an **in-place, surgical** replacement (only in those two files).

```bash
# from repo root (new branch)
git checkout -b fix/api-router-prefix
node scripts/apply-router-path-fix.mjs

# run tests (in-memory mode)
FF_PERSISTENCE=false npm test

# (optional) if Postgres is available
# npx prisma migrate deploy
# FF_PERSISTENCE=true npm test

git add backend/routes/features.ts backend/routes/usage.ts tests/features/active.api.test.ts tests/usage/usage.api.test.ts
git commit -m "fix(api): remove double /api by dropping prefix inside routers; add minimal endpoint tests"
git push -u origin fix/api-router-prefix
```

If you prefer to edit manually, simply change any occurrences of `/api/features/` to `/features/`
and `/api/usage/` to `/usage/` within those two files only.

## Files included
- `scripts/apply-router-path-fix.mjs` (safe in-place patcher)
- `tests/features/active.api.test.ts` (asserts `/api/features/active` exists)
- `tests/usage/usage.api.test.ts` (asserts `/api/usage/*` work)

