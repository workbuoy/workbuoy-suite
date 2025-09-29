## PR9 – Release & polish

### Features
- Added `/api/health` and `/api/version` endpoints for lightweight availability checks.
- Gated optional CRM routes behind feature flags so WB_SKIP_OPTIONAL_ROUTES=1 produces a lean surface.

### Fixes
- Reworked Prisma seed ordering to avoid duplicate inserts and ensure idempotent bootstrap runs.

### Chores
- Added Node-based smoke tests covering health, metrics, version, and CRM readiness endpoints.
