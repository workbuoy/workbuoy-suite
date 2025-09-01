# Deploy – Helm charts for WorkBuoy Suite

Dette chartet deployer tre komponenter:
1. **CRM API** (`workbuoy-crm-api`) – Express/Node API med Prometheus `/metrics`
2. **Connectors Worker** (`workbuoy-connectors-worker`) – Redis-basert jobbkø prosessor
3. **Desktop Update** (`workbuoy-desktop-update`) – NGINX som server oppdateringsfeed for Electron

## Hurtigstart (staging)
```bash
helm upgrade --install workbuoy ops/helm/workbuoy   -n workbuoy --create-namespace   -f ops/helm/workbuoy/values-staging.yaml
```

## Verdier
Se `values.yaml` for alle felter. Viktige:
- `crmApi.env.RBAC_ENFORCE` (default `true`)
- `crmApi.env.REDIS_URL`
- `connectorsWorker.env.CRM_BASE_URL`
- `ingress.hosts[*].host` og `ingress.tls.*`
- `desktopUpdate.volume.existingClaim` for persistent oppdateringsfeed

## Prometheus
Aktiver ServiceMonitor hvis du bruker kube-prometheus-stack:
```yaml
prometheus:
  serviceMonitor:
    enabled: true
    labels:
      release: kube-prometheus-stack
```
Dashboard JSON: `ops/dashboards/workbuoy_crm_desktop.json`.

## Produksjon
Se `values-prod.yaml` for HPA, flere replicas og OTEL-endpoint.

## RBAC/SSO/SCIM
Dette chartet forventer at autentisering/autorisasjon er satt opp i appen (f.eks. via OIDC-proxy). SCIM og SSO dekning leveres i egne PRs.

## Rollback
```bash
helm rollback workbuoy <REVISION>
```
