# Deployment & Scaling

## IaC Stubs
- `infra/terraform/` — Terraform skeleton for Postgres + API container.
- `infra/helm/` — Helm chart skeleton for Kubernetes deploys.

## SSO
- OAuth2/OIDC via provider (Auth0/Entra/Google). Configure `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` in environment.

## Retries & Fault Tolerance
- HTTP adapters use exponential backoff (see `lib/policies.js` retry guidance).
- Meta rollback provides safe restore path.
- Use liveness/readiness probes in Helm values.

## Scaling
- Stateless API, horizontal scale.
- Postgres with connection pooling (PgBouncer).