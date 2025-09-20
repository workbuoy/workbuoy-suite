# Roles & Feature Caps

Workbuoy persists role definitions, feature metadata, tenant overrides and user bindings in Postgres when `FF_PERSISTENCE=true`. The registry still supports the in-repo JSON seed for offline development.

## Data Model

| Table | Purpose |
|-------|---------|
| `Role` | Canonical role definitions (`role_id`, inherits, feature caps, scope hints, JSON profile). |
| `Feature` | Feature catalog with descriptions, default autonomy caps and capability ids. |
| `OrgRoleOverride` | Tenant-specific overrides for role caps and disabled features. Composite key `(tenant_id, role_id)`. |
| `UserRole` | User→role bindings (`primaryRole`, optional `secondaryRoles`). |

`featureCaps` are stored as JSON maps of `featureId → autonomyCap (1..6)`. Overrides clamp values between 0 and 6; `disabledFeatures` force a cap of zero.

## Seeding & Import

1. Ensure Postgres is running and `DATABASE_URL` is exported.
2. Seed from the repository JSON: `npx ts-node scripts/seed-roles-from-json.ts`
   - The script loads `roles/roles.json` and `src/roles/seed/features.ts`, upserts into Postgres, and refreshes the registry cache.
3. Admins can re-import via API: `POST /api/admin/roles/import` with `x-role-id: admin`.

When `FF_PERSISTENCE=false`, the registry falls back to in-memory data (`loadRolesFromRepo` + `defaultFeatures`).

## Tenant Overrides

`PUT /api/admin/roles/:roleId/overrides`

```bash
curl -X PUT \
  -H 'x-role-id: admin' \
  -H 'x-tenant: ACME' \
  -H 'Content-Type: application/json' \
  -d '{"featureCaps": {"cashflow_forecast": 4}, "disabledFeatures": ["contract_compliance"]}' \
  http://localhost:3000/api/admin/roles/sales-manager-account-executive/overrides
```

The registry merges role caps with overrides at read time. `RoleRegistry.getUserContext()` exposes the resolved `featureCaps` and active features for a binding.

## Inspecting Effective Caps

`GET /api/admin/roles/:roleId` returns:

- `override` — current tenant override (if any)
- `effective.featureCaps` — resolved caps after inheritance + overrides
- `effective.features` — activatable features with autonomy caps and ranking basis

Use this endpoint when debugging proactivity downgrades.
