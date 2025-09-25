# Onboarding

## Clean Install (Recommended)

```bash
git clean -fdx        # remove untracked files, including old node_modules
npm ci                # install dependencies for the workspace
npm run typecheck     # verify types across apps
npm test              # run test suites
```

## Active Apps

- **Backend:** `apps/backend`
- **Frontend:** `apps/frontend`

## Useful Scripts

- `npm run guard:ban-tracked-deps` — ensure no dependencies are tracked.
- `npm run prisma:generate` — backend Prisma client generation.
- `npm run seed:roles` — seed baseline roles/features.

See `docs/STRUCTURE.md` and `README.md` for a high-level repo map.
