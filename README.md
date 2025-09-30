Workbuoy Suite
===============

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

- Install dependencies: `npm ci`
- Run backend smoke tests to verify core routes: `npm run -w @workbuoy/backend test:smoke`
- Persistence workflow:
  1. `npm run db:prepare -w @workbuoy/backend` (generate Prisma client → deploy migrations)
  2. `npm run db:seed -w @workbuoy/backend` to load baseline data
- Run the backend locally with optional routes disabled:

```bash
WB_SKIP_OPTIONAL_ROUTES=1 node --import tsx apps/backend/src/index.ts
```

### Backend metrics

- Set `METRICS_ENABLED=true` to enable Prometheus HTTP metrics in `apps/backend`.
- Override the endpoint path with `METRICS_ROUTE` (default `/metrics`).

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
