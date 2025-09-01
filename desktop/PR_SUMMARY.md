# WorkBuoy Desktop – Final Ready (v2.0.0)

## Ikke-teknisk sammendrag
- Desktop-appen er ferdigpolert og produksjonsklar, på linje med SaaS/Enterprise.
- Offline-first med konfliktløsning, cross-device roaming, plugin-markedsplass og AI-innsikter.
- CI/CD bygger og publiserer signerte artefakter for macOS/Windows/Linux.

## Tekniske høydepunkter
- **Sync/Queue**: retry/backoff, workflow-batcher (`wf_id`), konflikt-håndtering (LWW + audit hooks), CRDT-hook tilgjengelig.
- **Auth/RBAC**: OIDC via Enterprise (web-login) + RBAC sync (`/rbac/me`) for UI-gating.
- **Roaming**: kryptert synk av session/drafts/settings via `roaming.js` og `secrets.js`.
- **Plugins**: marketplace UI, statisk adapter-registry, enable/disable + health-check, metrics.
- **AI-innsikt**: bakgrunnsaggregasjon per org; dashboards i Next.js UI (skalert senere).
- **Observability**: Prometheus-metrics + OTEL tracing; dashboardskisser vedlagt.
- **Logging**: robust logger med PII-maskering; audit-posting til backend.
- **Packaging**: electron-builder for alle OS; GitHub Actions for lint, test, build og release.

## ENV-matrise
| ENV | Nøkler |
|-----|-------|
| Felles | `WB_PORTAL_BASE_URL`, `WB_API_BASE_URL`, `WB_PREFER_BEARER`, `WB_SYNC_PAGE_SIZE`, `WB_SYNC_CONCURRENCY` |
| Auth  | `WB_OIDC_CLIENT_ID`, `WB_OIDC_TENANT`, `WB_OIDC_REDIRECT_URI` |
| Secrets | `WB_SECRETS_KEY` (AES-256-GCM) |
| Observability | `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`, `WB_LOG_JSON` |
| Update | `WB_UPDATE_CHANNEL` (`beta`/`stable`) |

## Risiko og mitigering
- **Plugins**: kun statisk registrerte adaptere lastes. Ingen dynamisk eval; signering kan aktiveres i neste PR med `tweetnacl`.
- **Roaming**: kryptert med nøkkel fra secrets-provider (ENV fallback).
- **Konflikter**: LWW default; CRDT kan toggles per tenant når klart.

## Test & QA
- `npm test` → Jest (queue/konflikt/plugins/ai).
- `npm run test:e2e` → Playwright smoke (oppstart og UI). E2E-utvidelser planlagt.

## Rollout & Rollback
- Rollout via GitHub Releases (beta → stable kanaler). 
- Rollback: installer tidligere versjon via Releases (auto-update respekterer kanal).
