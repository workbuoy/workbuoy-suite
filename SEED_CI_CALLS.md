# Seeding roles/features in CI

## Recommended runner
```
- name: Seed roles/features from JSON
  run: npm run seed:roles -w @workbuoy/backend
  env:
    DATABASE_URL: ${{ env.DATABASE_URL }}
    ROLES_PATH: packages/roles-data/roles.json # optional override
    FEATURES_PATH: packages/roles-data/features.json # optional override
```

The unified entrypoint lives in `apps/backend/prisma/seed.ts`. Use
`npm run seed:dry-run -w @workbuoy/backend` to exercise the parser
without connecting to a database.

The CommonJS wrapper (`scripts/seed-roles-from-json.cjs`) delegates to
the same runner.
