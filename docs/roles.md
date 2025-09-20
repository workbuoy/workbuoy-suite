# Role persistence & registry

Workbuoy now stores the role catalogue, feature catalogue and tenant overrides in Postgres via Prisma. The tables are seeded from `roles/roles.json` and the built-in feature seed (`src/roles/seed/features.ts`) when persistence is enabled (`FF_PERSISTENCE=true`).

## Data model

| Table                | Purpose                                           |
|----------------------|---------------------------------------------------|
| `Role`               | Canonical role definitions + inheritance + caps.  |
| `Feature`            | Feature catalogue (id, title, default autonomy).  |
| `OrgRoleOverride`    | Tenant-level overrides & disabled feature lists.  |
| `UserRole`           | Persisted user ⇄ role bindings.                   |

Tenant overrides win over the canonical definition: overrides can set new caps or mark features as disabled (`0`). The `RoleRegistry` reads roles, features and overrides from the database, merges them and exposes feature caps to proactivity and capability runners.

## Seeding from JSON

Run the seed helper after configuring `DATABASE_URL` and enabling persistence:

```bash
FF_PERSISTENCE=true npx ts-node scripts/seed-roles-from-json.ts
```

The script is idempotent (it upserts definitions). The `/api/admin/roles/import` endpoint uses the same helper so operators can reseed from CI or a control plane.

## Tenant overrides

Use the admin API to manage overrides:

```bash
curl -X PUT \
  -H 'x-tenant: TENANT' \
  -H 'x-roles: admin' \
  -H 'content-type: application/json' \
  http://localhost:3000/api/admin/roles/sales-junior-account-executive/overrides \
  -d '{"featureCaps":{"cashflow_forecast":5},"disabledFeatures":["contract_compliance"]}'
```

Fetching `GET /api/admin/roles/:roleId` shows the merged caps (`featureCaps`), the raw override stored in Postgres and the feature list that will be exposed to capability runners.

## User bindings

`resolveUserBinding` persists fallback bindings when a request provides `x-user` and `x-role`. That means the first call seeds the `UserRole` table; subsequent calls reuse the stored binding. This keeps proactivity context, feature activation and policy guards consistent across requests and background workers.

When `FF_PERSISTENCE=false` the registry falls back to the in-repo JSON loader and in-memory overrides so existing in-memory behaviour remains unchanged.
