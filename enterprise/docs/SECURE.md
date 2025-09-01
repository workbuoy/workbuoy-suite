# Secure Enterprise Edition

Enterprise-grade security additions.

## RBAC
- `lib/secure/rbac.js` — role permissions and enforcement helpers.
- Default roles: `admin`, `analyst`, `agent`, `auditor`.

## Compliance API
- `GET /api/secure/compliance?action=gdprExport` — GDPR data export (stub).
- `GET /api/secure/compliance?action=incidentReport` — incident workflow template (stub).
- `GET /api/secure/compliance?action=soc2` — SOC2 attestation checklist (stub).
- `GET /api/secure/compliance?action=hipaa` — HIPAA safeguards (stub).

## Notes
- GDPR export includes recent audit entries only (no PII emitted by default).
- Tsunami write-back remains behind a feature flag.