# Deployment Notes (Connectors Round 2)

- Ensure ExternalSecrets for all new connectors.
- Set OIDC and Stripe variables as before.
- Import Grafana dashboards; apply SLO alert rules.
- Scale via HPA; verify ServiceMonitor discovers /api/metrics.
