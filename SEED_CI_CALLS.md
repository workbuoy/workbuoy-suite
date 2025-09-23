# Seeding roles/features in CI

## Recommended tsx runner
```yaml
- name: Seed roles/features from JSON
  run: npm run seed:roles
  env:
    FF_PERSISTENCE: 'true'
    DATABASE_URL: ${{ env.DATABASE_URL }}
    ROLES_PATH: core/roles/roles.json # optional override
    FEATURES_PATH: core/roles/features.json # optional override
```

The script logs the resolved file paths and upsert summary. It will exit early
when `FF_PERSISTENCE` is not enabled or throw if `DATABASE_URL` is missing.
Shared logic lives in `scripts/seed-roles-lib.ts` and the CommonJS wrapper
(`scripts/seed-roles-from-json.cjs`) delegates to the same runner.
