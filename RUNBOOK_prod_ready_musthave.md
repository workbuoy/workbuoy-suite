# Prod Ready — Must-Have (1–11)

**Mode:** ZIP-only; ingen eksterne kjøringer gjort av meg. Du har her *filer, skript og runbooks* klare for aktivering.

## 1) Secrets
- Se `env/secrets.example.env`
- Valider: `scripts/verify_env.sh`

## 2) SaaS Deploy + Verify (stage)
- Deploy: `scripts/deploy_helm_stage.sh`
- Verify: `scripts/verify_saas.sh`

## 3) Integrasjoner
- Stripe: `integrations/stripe_webhook_bind.README.md`
- SAML/SCIM: `integrations/saml_scim.README.md`

## 4) CRM
- Migre: `scripts/crm_migrate.sh`
- Import: `scripts/crm_import.sh` (x-api-key + Idempotency-Key)

## 5) Desktop
- Pipeline: `scripts/desktop_pipeline.sh` (probe → build)
- Sign/Notarize: sanitert `scripts/macos_sign_notarize.sh` (bruk CI secrets)
- Update-feed: `scripts/gen_latest_json.sh` + `dist/latest.json.template`

## 6) Roles Gate
- Kjør: `scripts/run_roles_gate.sh`
- Rapporter: `reports/roles/*` (allerede generert i tidligere ZIP)

## 7) PR Preview
- Manuell helper: `scripts/pr_preview_namespace.sh <PR>`
- Workflow-mal: `.github/workflows/pr-preview.yml`

## 8) Observability
- Alerts apply: `observability/apply.sh`
- Dashboard: `observability/grafana/*`

## 9) DSR Smoke
- Kjør: `scripts/run_dsr_smoke.sh` (krever `DSR_TOKEN`)

## 10) Docgen i CI
- Kjør: `scripts/run_docgen.sh` → åpne PR med CI-trinnet ditt

## 11) Meta Foundation (proposal-only)
- Aktiver: `meta/ACTIVATION.md`
- Kill-switch: `AI_BUILDER_ENABLED=false`
- Governance: `.github/CODEOWNERS`, `SECURITY.md`, `CONTRIBUTING.md`

---
Generert: 2025-08-29T19:54:03.702677Z
