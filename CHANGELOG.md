## 1.1.0 (2025-09-30)

### Added
- BuoyDock widget for docked dashboard workflows.
- Dashboard state views with empty/error/partial semantics.
- Accessibility QA harness and automated contract tests in CI.

### Improved
- Metrics headers and default labels for consistent observability.
- FlipCard accessibility polish and keyboard ergonomics.
- ProactivitySwitch clarity for proactive/reactive states.

### Fixed
- Focus return when collapsing the dock UI.
- Type checking stability via tsconfig test file exclusions.

## PR23 – QA a11y & kontrakt (frontend + backend)

### Added – QA a11y & contract checks.
- apps/frontend: Lettvekts axe-sjekk for `/dashboard` og `/dock-demo` via Vitest (`npm run qa:a11y -w @workbuoy/frontend`).
- apps/backend: Vitest-kontrakter for `GET /api/version` og `GET /metrics` validerer headers, semver og Prometheus-labels.
- CI: Ikke-blokkerende QA-steg som rapporterer feil i `$GITHUB_STEP_SUMMARY` og dokumentasjon for lokale kjørsler.

## PR22 – Observability polish (metrics + logs)

### Improved
- apps/backend: Prometheus registry enforces `service="backend"` and `version="<package version>"` default labels without duplicate `service_name` entries.
- apps/backend: `/metrics` always responds `200 OK` with `text/plain; version=0.0.4; charset=utf-8`, returning an empty body when no metrics are registered.
- apps/backend: `/observability/logs/ingest` writes structured log lines `{ level, message, ts, reqId }` and generates a UUID `reqId` when trace headers are absent.
- apps/backend: Trace middleware backfills `reqId` for downstream log ingestion.
- Docs/tests: Updated observability docs and Jest coverage for metrics headers/labels and structured logging.

## PR20 – Dashboard state views (empty/error/partial)

### Added
- apps/frontend: `/dashboard` har nye tom-, feil- og delvis-lastede visninger med aria-live-status, aria-busy og fokusbevaring på "Prøv igjen".
- apps/frontend: Partial-visning viser N av M paneler med tydelig chip og beskrivelser som kobles via `aria-describedby`.
- apps/frontend: Nye Vitest-tester dekker empty/error/partial/ready, tastaturretry og live-region-oppdateringer.

### Docs
- README/CHANGELOG oppdatert med "State views".

## PR19 – Dashboard UI-polish (a11y, fokus, semantikk)

### Improved
- apps/frontend: `/dashboard` bruker nå semantiske `main`/`section`-landemerker med ryddig heading-hierarki og fokus-flyt til hovedinnholdet.
- apps/frontend: Interaktive tiles er tabbable toggle-knapper med tydelige fokusringer, tastatursnarveier (Enter/Space) og live-status for proaktiv/reaktiv visning.
- apps/frontend: Skjelettlasting annonseres via `aria-busy` + `aria-describedby`, og statusmeldinger bruker `role="status"` for skjermlesere.
- apps/frontend: Nye Vitest + Testing Library a11y-tester verifiserer landmarks, tabrekkefølge, tastaturstøtte, live-region og busy-state.

## PR18 – Dashboard-shell (frontend, a11y-first)

### Added – dashboard-shell.
- apps/frontend: Ny `/dashboard`-rute med tilgjengelige tiles, ProactivitySwitch og FlipCard med skjelettlasting.

## PR16 – Frontend demo-app (FlipCard + ProactivitySwitch)

### Added
- apps/frontend: La til `/demo`-rute som viser FlipCard og ProactivitySwitch med tastaturnavigasjon og live-status.

## PR15 – Observability-tester (telemetry & logging, backend/Jest)

### Added – observability-testdekning.

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
