# Seeding roles/features in CI

## Option A — ESM (recommended)
```yaml
- name: Seed roles/features from JSON
  run: node --loader ts-node/esm scripts/seed-roles-from-json.ts
  env:
    DATABASE_URL: ${{ env.DATABASE_URL }}
    FF_PERSISTENCE: 'true'
```

## Option B — CommonJS wrapper
```yaml
- name: Seed roles/features from JSON (CJS)
  run: node scripts/seed-roles-from-json.cjs
  env:
    DATABASE_URL: ${{ env.DATABASE_URL }}
    FF_PERSISTENCE: 'true'
```

Both paths avoid importing the entrypoint from application code to prevent
ESM/CommonJS cycles. Shared logic lives in `scripts/seed-roles-lib.ts`.
