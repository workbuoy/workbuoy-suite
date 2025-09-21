# API Overview
- CRM: `openapi/crm.yaml`
- Tasks: `openapi/tasks.yaml`
- Log: `openapi/log.yaml`
- Finance: `openapi/finance.yaml`
- Buoy: `openapi/buoy.yaml`
- Manual: `openapi/manual.yaml`
- Proactivity: `openapi/proactivity.yaml`
- Roles & Overrides: see `/api/admin/roles/*` in `openapi/proactivity.yaml`
- Feature usage telemetry: `/api/usage/*`
- Feature activation: `/api/features/active`
- Geo: `openapi/openapi.yaml` (`/api/v1/geo/*`)

CI runs Spectral (non-blocking) over all specs.

## Examples

```bash
# Import roles & features into Postgres (requires FF_PERSISTENCE=true)
curl -X POST http://localhost:3000/api/admin/roles/import \
     -H 'x-role-id: admin'

# Override tenant role caps
curl -X PUT http://localhost:3000/api/admin/roles/sales_manager/overrides \
     -H 'Content-Type: application/json' \
     -H 'x-role-id: admin' \
     -H 'x-tenant: DEV' \
     -d '{"feature_caps":{"crm.contacts":3},"disabled_features":[]}'

# Inspect ranked active features for a user
curl "http://localhost:3000/api/features/active" \
     -H 'x-tenant: DEV' -H 'x-user: u1' -H 'x-role: sales_manager'

# Record feature usage (aggregated for ranking)
curl -X POST http://localhost:3000/api/usage/feature \
     -H 'Content-Type: application/json' \
     -d '{"userId":"u1","tenantId":"DEV","featureId":"crm.contacts","action":"open"}'

# Update subscription caps / kill switch
curl -X PUT http://localhost:3000/api/admin/subscription \
     -H 'Content-Type: application/json' \
     -H 'x-role-id: admin' -H 'x-tenant: DEV' \
     -d '{"plan":"secure","killSwitch":false,"secureTenant":true}'

# Resolve proactivity state with compat mapping
curl -H "x-tenant: TENANT" -H "x-user: user" -H "x-role: sales_rep" \
     -H "x-proactivity-compat: 2" https://api.workbuoy.local/api/proactivity/state

# Approve a proposal (requires Kraken mode)
curl -X POST -H "x-tenant: TENANT" -H "x-user: approver" -H "x-role: manager" \
     -H "x-proactivity: kraken" -H "Idempotency-Key: proposal-123" \
     https://api.workbuoy.local/api/proposals/PROPOSAL_ID/approve
```
