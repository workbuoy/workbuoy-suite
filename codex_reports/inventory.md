# Workbuoy Suite – Inventarrapport

## Oversikt
- Monorepo for Workbuoy Suite med npm workspaces (apps, packages, enterprise, crm, connectors, desktop, sdk, docs, telemetry, examples).
- Primært TypeScript/JavaScript-kodebase med tillegg av JSON/YAML-konfigurasjon, SQL-migrasjoner og enkelte Python-moduler.

## Workspaces
- **Apps:** backend, frontend
- **Packages:** backend, backend-auth, backend-metrics, backend-rbac, backend-telemetry, roles-data, ui
- **Standalone workspaces:** enterprise (Next.js app + infra), crm, connectors, desktop (Electron/Node), sdk/*, docs, telemetry, examples/*

## Tooling og konfigurasjon
- Pakkehåndterer: npm (package-lock.json)
- Lint/format: eslint.config.mjs, docs/.eslintrc.cjs, .prettierignore
- TypeScript: tsconfig.json, tsconfig.base.json, tsconfig.meta.json, flere pakke-spesifikke tsconfig-filer
- Testing: jest (apps/backend, enterprise), vitest (packages/ui), custom scripts i desktop og enterprise

## API og kontrakter
- OpenAPI-spesifikasjoner i `openapi/` (buoy.yaml, crm.yaml, finance.yaml, log.yaml, manual.yaml, meta.yaml, proactivity.yaml, tasks.yaml, workbuoy.yaml m.fl.)

## Infrastruktur og levering
- Dockerfiler: `Dockerfile`, `apps/frontend/Dockerfile`
- Helm charts: `deploy/helm/workbuoy`, `enterprise/helm`, `enterprise/infra/helm`, `ops/helm/workbuoy`
- Kubernetes-manifester: `manifests/`, `ops/alerts`, `ops/supplychain`
- Terraform: `enterprise/infra/terraform/main.tf`, `enterprise/terraform/main.tf`
- Docker Compose: `docker-compose.yml`

## Observability
- Grafana dashboards: `observability/grafana/*.json`
- Alertmanager-regler: `observability/alerts/workbuoy_alerts.yaml`

## Data og persistens
- Prisma schema: `prisma/schema.prisma`
- SQL-migrasjoner: `prisma/migrations/**`, `db/migrations/**`
- Seed/data scripts i `scripts/`, `db/`

## Øvrige noter
- Flere dokumentasjonsmapper (`docs/`, `META_*`, `README_*`)
- Security-policy: `SECURITY.md`
- CI-workflows: `.github/workflows/*.yml`
