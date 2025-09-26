Workbuoy Suite
===============

Monorepo for the Workbuoy platform.

What’s here
-----------

- apps/backend — API & services
- apps/frontend — Web app
- types/ — shared ambient types
- tools/ — repo guards, scripts
- deploy/ — Helm charts & k8s manifests
- docs/ — guides, ADRs, policies

Quick start
-----------

```
git clean -fdx         # clean workspace (removes old node_modules, builds)
npm ci                 # install for the workspace
npm run typecheck      # types across apps
npm test               # tests across apps
# (optional) generate prisma client + seed baseline roles/features
npm run prisma:generate -w @workbuoy/backend
npm run prisma:migrate:deploy -w @workbuoy/backend
npm run seed:dry-run   -w @workbuoy/backend  # CI-safe
# run apps
npm run -w @workbuoy/backend start  # adjust if start script exists
npm run -w @workbuoy/frontend dev   # dev server
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
- [Governance](docs/GOVERNANCE.md)
- [Workbuoy Architecture (Core/Flex/Secure + Navi/Buoy AI/Roles/Proactivity)](docs/architecture/workbuoy-architecture.md)

Governance
----------

- CODEOWNERS routes reviews to the right teams.
- Dependabot updates npm workspaces & Actions weekly (grouped).
