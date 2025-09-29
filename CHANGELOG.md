## PR14 – Observability-tester (telemetry & logging)

### Added – observability-tester for telemetry/logging.

## PR13 – CRM smoke-tester

### Added – CRM smoke-tester og /metrics-validering.

## PR9 – Release & polish

### Features
- apps/backend: Exposed `/api/health` and `/api/version` endpoints with optional route guards to simplify status probes.
- packages/ui: Shipped `FlipCard` and `ProactivitySwitch` components for shared UX patterns.

### Fixes
- apps/backend: Hardened database seeding and role bootstrap for repeatable environments.

### Chores
- apps/backend: Added smoke tests that exercise health, metrics, and CRM integrations during CI.

### Docs
- Monorepo: Documented quickstart workflows and release highlights for the PR9 cut.

## PR AV
- Added AI smoke, Desktop conflict/load E2E, SQLCipher probe, dev onboarding, samples.
