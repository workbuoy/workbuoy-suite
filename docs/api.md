# API Overview
- CRM: `openapi/crm.yaml`
- Tasks: `openapi/tasks.yaml`
- Log: `openapi/log.yaml`
- Finance: `openapi/finance.yaml`
- Buoy: `openapi/buoy.yaml`
- Manual: `openapi/manual.yaml`
- Proactivity: `openapi/proactivity.yaml`
- Core (roles/usage/admin): `openapi/openapi.yaml`

CI runs Spectral (non-blocking) over all specs.

## New endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/features/active` | Ranked feature activation list (requires `x-tenant`, `x-user`, `x-role`). |
| POST | `/api/usage/feature` | Record feature usage events (`open`, `complete`, `dismiss`). |
| GET | `/api/usage/aggregate/{userId}` | Aggregate usage counts per feature for a user. |
| POST | `/api/admin/roles/import` | Seed roles/features from `roles/roles.json`. Requires admin header. |
| PUT | `/api/admin/roles/{roleId}/overrides` | Upsert tenant overrides (caps / disabled). |
| GET | `/api/admin/roles/{roleId}` | Inspect merged role caps for a tenant. |
| GET/PUT | `/api/admin/subscription` | Inspect or update plan, kill switch, secure flags and overrides. |

Example import call:

```bash
curl -X POST \
  -H 'x-tenant: TENANT' \
  -H 'x-roles: admin' \
  http://localhost:3000/api/admin/roles/import
```

The OpenAPI spec now documents request/response schemas for the new routes so tooling (SDK generation, contract tests) stays in sync.
