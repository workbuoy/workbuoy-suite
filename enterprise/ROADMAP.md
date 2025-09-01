# ROADMAP (Uke 2 – Fase 1b)

- [x] CI: Jest coverage gate ≥80%
- [x] CI: Playwright E2E (smoke + fuzz)
- [x] Fuzz-test: JWT > subdomain > header > query; T2 ser aldri T1-data
- [x] Next.js security headers (HSTS/CSP/etc.)
- [x] Helm: Ingress for {tenant}.{WB_BASE_DOMAIN} m/TLS; app-port 3000
- [x] DEPLOYMENT.md: “Subdomener & TLS”


## Fremtidig (Uke 8+) — wb2wb (ikke implementert)
- Feature toggle: WB_WB2WB_ENABLED=false (default)
- Formaal: samtykkebasert deling mellom WorkBuoy-tenant’er
- Krav for oppstart: sikkerhetsreview, billing-modell, GDPR/DPIA
