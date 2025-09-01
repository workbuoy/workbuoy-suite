# PR K: Helm-chart + prod gates

## Endringsplan
- Helm-chart for CRM, import/export, connectors, desktopSync
- Feature-toggles (enabled flags, readOnlyMode)
- Security: PodSecurityContext, NetworkPolicy
- Observability: OTEL env vars, ServiceMonitor
- Docs: `docs/HELM_DEPLOY.md`
- CI: `.github/workflows/helm-lint.yml`

## Test
```bash
cd ops/helm/workbuoy
helm lint .
helm template workbuoy .
```

## Manuell validering
- Deploy til dev cluster, sjekk pods, ingress, metrics
- Toggle `desktopSync.enabled` og bekreft pods skaleres ned

## Rollback
- `helm uninstall workbuoy` eller `enabled=false` for moduler i values
