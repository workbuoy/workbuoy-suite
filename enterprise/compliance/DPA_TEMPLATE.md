# Data Processing Addendum (DPA) — WorkBuoy

**Roles:** Controller (Customer), Processor (WorkBuoy)**Data Types:** PII (contact details, identifiers), product telemetry, support metadata.**Subprocessors:** See [SUBPROCESSORS.md](./SUBPROCESSORS.md).**SCCs/UK Addendum:** Incorporated by reference (Module 2).

## Processing Instructions
- Purpose: Provide WorkBuoy services.
- Duration: Subscription term + 30 days.
- Categories of data subjects: End users, admins, prospects.

## Security Measures
- Access control (RBAC, SSO), encryption at rest (KMS envelope), in transit (TLS).
- WORM audit logging for sensitive ops.
- Backups (daily full, 15-min WAL).
- DR: RTO/RPO per [BCDR.md](../BCDR.md).

## Data Subject Requests
WORM-audited workflows; see `lib/secure/dsr.js`.

## Deletion & Return
Export within 30 days upon termination; secure deletion per policy.

## Contact
DPO: dpo@workbuoy.ai

**DPO Sign-off:** _Name, Date_
