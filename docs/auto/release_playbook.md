# Release Playbook (Auto-generated)

This document summarizes the release process gates for SaaS, CRM, and Desktop.

## SaaS
- Helm apply: ⛔ (requires cluster/secrets)
- /healthz, /readyz verification: ⛔
- Stripe webhook bind: ⛔ (manual secure runner)
- SAML/SCIM config: ⛔ (manual secure runner)

## CRM
- DB migrations: ⛔ (needs DATABASE_URL)
- Contacts import: ⛔ (needs API_KEY)
- Buoy AI smoke test: ⛔

## Desktop
- SQLCipher probe: ⛔ (needs build env)
- Electron build: ⛔
- Code-sign/notarize: ⛔ (requires Apple/Win certs)
- Update feed publish: ⛔
- E2E conflict/load test: ⛔

## Always
- Dashboards/alerts: ⛔ (ops pipeline)
- DSR smoke: ⛔

## Already Delivered (locally built)
- ✅ PyPI wheel built
- ✅ Release seal generated
- ✅ Auto-update manifest (example)
- ✅ Helm values (stage/prod)
- ✅ STATUS.md updated

---
Generated: 2025-08-29T19:27:44.050368Z
