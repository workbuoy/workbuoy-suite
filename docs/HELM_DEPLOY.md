# Helm Deploy – WorkBuoy Suite

## Forutsetninger
- Kubernetes cluster med Ingress Controller
- Prometheus Operator (for ServiceMonitor) og OTEL Collector
- Postgres og Redis tilgjengelig

## Rask start (dev)
```bash
helm upgrade -i workbuoy ops/helm/workbuoy   --set image.repository=ghcr.io/workbuoy/backend   --set image.tag=1.0.0   --set secrets.enabled=true   --set-string secrets.data.API_KEY_DEV=dev-123
```

## Prod eksempel
Se `ops/helm/workbuoy/values-prod.yaml` for eksempelkonfig.

## Feature flags / prod gates
- `env.CRM_API_ENABLED`, `env.CRM_IMPORT_EXPORT_ENABLED`, `env.CONNECTORS_ENABLED`, `env.SYNC_ENABLED`
- `env.READ_ONLY_MODE` – tvinger API til kun GET (krever håndtering i app, anbefalt guard i middleware)

## Observability
- `/metrics` eksponert via Service + ServiceMonitor
- OTEL endpoint settes via `env.OTEL_EXPORTER_OTLP_ENDPOINT`

## Sikkerhet
- NetworkPolicy begrenser trafikk til nødvendige namespaces/porter
- PodSecurityContext kjører som non-root
- Secrets refereres fra `values.yaml`

## CI
- Se `.github/workflows/helm-lint.yml` som kjører `helm lint` og `helm template`
