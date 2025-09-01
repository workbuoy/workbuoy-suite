# Security & Hardening

## HTTP-sikkerhet
- **Helmet** med streng CSP (default-src 'none', frame-ancestors 'none'), referrerPolicy no-referrer, XSS-beskyttelse via moderne header-sett.
- **CORS** med allowlist (`CORS_ORIGINS`), default **ingen** cross-origin.
- **Rate limiting**:
  - API: `RATE_LIMIT_API_MAX` per `RATE_LIMIT_API_WINDOW_MS` (default 600 req/min)
  - Webhooks: `RATE_LIMIT_WEBHOOK_MAX` per `RATE_LIMIT_WEBHOOK_WINDOW_MS` (default 120 req/min)

## Secrets
- Leses fra `SECRET_FILE` (JSON) med detektering av rotasjon (mtime).
- Fallback til miljøvariabler ved fravær.
- Anbefalt: mount som **Kubernetes Secret**; roter ved å oppdatere filen (pod reloader ved sidecar/rollout).

## RBAC
- `x-user-role` (viewer, contributor, manager, admin) – se `src/rbac/enforce.ts`. Prod bør koble mot OIDC-claims.

## Anbefalinger
- Aktiver mTLS mellom pods ved behov.
- Sett opp WAF-regler for `/api/v1/connectors/*`.
- Logg kun nødvendige felter i audit; vurder PII-redaksjon.

## Miljøvariabler
| Nøkkel | Beskrivelse | Default |
|---|---|---|
| `CORS_ORIGINS` | Komma-separerte origins, `*` tillater alle | *(tom)* |
| `RATE_LIMIT_API_MAX` / `RATE_LIMIT_API_WINDOW_MS` | API rate limit | 600 / 60000 |
| `RATE_LIMIT_WEBHOOK_MAX` / `RATE_LIMIT_WEBHOOK_WINDOW_MS` | Webhook rate limit | 120 / 60000 |
| `SECRET_FILE` | JSON-fil med hemmeligheter | /etc/workbuoy/secrets.json |
| `SECRET_TTL_MS` | Cache-TTL for secrets | 5000 |
