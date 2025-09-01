# PR V: Helm charts + dashboards + CI

## Endringsplan
- **Helm-chart**: `ops/helm/workbuoy` med Deployments for `crm-api`, `connectors-worker`, `desktop-update`
- **Ingress**: felles Ingress med path-routing
- **HPA**: konfigurert for CRM API
- **Prometheus**: valgfri `ServiceMonitor`
- **Dashboards**: `ops/dashboards/workbuoy_crm_desktop.json`
- **CI**: `.github/workflows/helm-validate.yml` – `helm lint`, `helm template` og kubeval

## Test-kommandoer
```bash
helm lint ops/helm/workbuoy
helm template workbuoy ops/helm/workbuoy -f ops/helm/workbuoy/values-staging.yaml | less
```

## Manuell validering
- Deploy til et test-cluster og verifiser at `/healthz` svarer på CRM, at Ingress ruter til `/` og `/updates`, og at `/metrics` skrapes.
- Importer dashboard JSON i Grafana og se at paneler viser data.

## Rollback
- `helm rollback workbuoy <REVISION>` eller `helm uninstall workbuoy`.
