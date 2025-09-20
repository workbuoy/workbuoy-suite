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

CI runs Spectral (non-blocking) over all specs.
