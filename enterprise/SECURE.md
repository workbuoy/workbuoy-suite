
# SECURE — DSR, Policy & SIEM

- Policy file: `secure.policy.json` with safe defaults (`force_read_only=true`).
- Every mutating flow must check RBAC, tenant, policy and WORM-audit.
- SIEM forwarder stub: `lib/secure/siem.js` (HTTP + HMAC ready).

## DSR Tables
- `dsr_requests`
- `consents`

## RBAC & Tenants
- See `lib/secure/rbac.js` for access checks.


## PII Encryption
- PII fields configured in `public/config/pii.fields.json`.
- Encryption occurs via `lib/db/middleware.js` in write paths; reads are decrypted unless masking policy is on.
- Metrics: `wb_kms_ops_total`, `wb_kms_errors_total`.


## Policy gates for new features
- Writeback auto-apply requires `secure.policy.json` rule: `dq.writeback.auto_apply: allow_if: ['rbac:role:admin','policy:change_manager']`
- All mutating ops emit WORM audit records via existing audit trail.

