Workbuoy Suite
===============

[![CI](https://github.com/workbuoy/workbuoy-suite/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/workbuoy/workbuoy-suite/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/storybook-live-ff4785?logo=storybook&logoColor=white)](https://workbuoy.github.io/workbuoy-suite/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Monorepo for the Workbuoy platform.

What’s here
-----------

- apps/backend — API & services
- apps/frontend — Web app
  - `/dashboard` har semantiske landmarks, tydelige fokusringer, tastaturnavigasjon og state views (tom/delvis/feil) med live-status.
- types/ — shared ambient types
- tools/ — repo guards, scripts
- deploy/ — Helm charts & k8s manifests
- docs/ — guides, ADRs, policies

Quickstart
----------

1. Install dependencies: `npm ci`
2. Backend:
   - Prepare persistence: `npm run db:prepare -w @workbuoy/backend`
   - Seed baseline data: `npm run db:seed -w @workbuoy/backend`
   - Run smoke tests: `npm run -w @workbuoy/backend test:smoke`
   - Start the API locally with optional routes disabled:

     ```bash
     WB_SKIP_OPTIONAL_ROUTES=1 node --import tsx apps/backend/src/index.ts
     ```

3. Feature flags (backend):
   - `CRM_ENABLED=true` aktiverer CRM-ruter for lokale integrasjonstester.
   - `METRICS_ENABLED=true` eksponerer Prometheus `/metrics` med headers `text/plain; version=0.0.4; charset=utf-8`.

4. Frontend:
   - Start Vite dev-server: `npm run dev -w @workbuoy/frontend`
   - QA a11y-sjekk lokalt: `npm run qa:a11y -w @workbuoy/frontend`

CI at a glance
--------------

- repo-guards: bans tracked node_modules, reports orphan workspaces
- ci: typecheck, tests, seed dry-run
- lint: ESLint blocking on apps/**, non-blocking for satellites
- containers: multi-stage images + Trivy (non-blocking) + SBOM
- helm: Helm lint + kubeconform (non-blocking)
- openapi: Spectral lint + diff to main (non-blocking)

Docs
----

- [Structure](docs/STRUCTURE.md)
- [Developer Quickstart](docs/DEV_QUICKSTART.md)
- [QA playbook](docs/qa.md)
- [Observability guide](docs/observability.md)
- [Asset Policy](docs/ASSET_POLICY.md)
- [ADR Template](docs/adr/README.md)
- [CI Notes](docs/CI_NOTES.md)
- [Infra & Storage Guide](docs/Infra.md)
- [Governance](docs/GOVERNANCE.md)
- [Workbuoy Architecture (Core/Flex/Secure + Navi/Buoy AI/Roles/Proactivity)](docs/architecture/workbuoy-architecture.md)

UI components
-------------

- [@workbuoy/ui component library](packages/ui/README.md)

Dashboard accessibility
-----------------------

- `/dashboard` fokuserer hovedinnholdet ved rute-aktivering, har live-status for proaktiv/reaktiv visning og skjermleservennlig skjelettlasting.
- Nye state views for tom, feil og delvis-lastet innhold annonseres via egen aria-live-region og støtter tastaturdrevet retry.

Governance
----------

- CODEOWNERS routes reviews to the right teams.
- Dependabot updates npm workspaces & Actions weekly (grouped).
