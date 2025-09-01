# WorkBuoy CRM & Desktop – Quickstart

Velkommen! Denne guiden tar deg fra lokal utvikling til staging og produksjon for **CRM** og **Desktop**.

## 1) Lokal utvikling
### Backend/API
```bash
cd backend
npm ci
npm run build
node dist/index.js
# Swagger UI: http://localhost:3000/docs
# Metrics:     http://localhost:3000/metrics
# Health:      http://localhost:3000/healthz
```
Nyttig:
- SSO (mock): `http://localhost:3000/auth/login?tenant=t1`
- SCIM: `curl -H "Authorization: Bearer scim-dev-token" -H "x-tenant-id: t1" http://localhost:3000/scim/v2/Users`

### Desktop
```bash
cd desktop
npm ci
npm run dev            # Electron dev
npm run dist           # Bygg .msi/.dmg/.pkg/.deb/.rpm/AppImage
```

## 2) Staging (Kubernetes)
Bruk Helm-chartet:
```bash
helm upgrade --install workbuoy ops/helm/workbuoy   -n workbuoy --create-namespace   -f ops/helm/workbuoy/values-staging.yaml
```
- **CRM API**: rutes via Ingress `/`
- **Desktop update feed**: rutes via Ingress `/updates`
- Grafana-dashboards: `ops/dashboards/*.json` (importer i Grafana)

## 3) Produksjon
- Bytt til `values-prod.yaml` (HPA, flere replicas, OTEL-endpoint).
- Sett opp SSO/SCIM (se `docs/SSO_SCIM.md`).
- Overvåkning: Se `docs/OBSERVABILITY_CRM.md` og dashboard JSON.

## 4) API & SDK
- OpenAPI: `openapi/workbuoy.yaml`
- Swagger: `/docs`
- Regenerer SDK: se `docs/API_SPECS.md`.

## 5) Enterprise-funksjoner
- RBAC: se `docs/RBAC_ENFORCEMENT.md`
- Import/Export & DLQ: `docs/IMPORT_EXPORT.md`
- Desktop: bygg/oppdateringer i `docs/DESKTOP_BUILDS.md`, sikkerhet i `docs/DESKTOP_SECURITY.md`

## 6) Desktop utrulling (MDM)
- **Windows/Intune**: se `docs/ENTERPRISE_DEPLOYMENT.md#windows-intune`
- **macOS/Jamf**: se `docs/ENTERPRISE_DEPLOYMENT.md#macos-jamf`
- **Linux/systemd**: se `docs/ENTERPRISE_DEPLOYMENT.md#linux-systemd`

---

## Miljøvariabler (utvalg)
| Nøkkel | Beskrivelse | Default |
|---|---|---|
| `RBAC_ENFORCE` | Håndhev RBAC i API | `true` |
| `OBS_CRM_ENABLE` | Slå på latency-middleware | `true` |
| `WB_UPDATE_URL` | Oppdateringsfeed for Desktop | (sett i miljø/MDM) |
| `WB_UPDATE_CHANNEL` | `stable`/`beta` | `stable` |
| `WB_AUTOUPDATE` | Auto-oppdatering (`true`/`false`) | `true` |
| `SCIM_BEARER_TOKEN` | Bearer for SCIM | `scim-dev-token` |

## Sikkerhetsnotater
- Desktop-cache er E2E-kryptert (PBKDF2 + AES-256-GCM). Se `docs/DESKTOP_SECURITY.md`.
- Audit-logg skriver til `.audit/` og eksponerer `audit_events_total`.
