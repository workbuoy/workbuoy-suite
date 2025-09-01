# DATA_MAP.md

This document enumerates systems, fields, and purposes for personal data processed by WorkBuoy.

## Systems
- Core DB (SQLite/Postgres): users, sessions, audit trails, DSR requests.
- Billing (Stripe or similar): invoices, subscription status.
- Product telemetry (optional): feature usage, errors (pseudonymous where possible).
- SIEM: WORM audit forwarding for compliance evidence.

## Data Fields (by table)

### users
- email (identifier)
- name, first_name, last_name, phone, locale, address (profile)
- created_at, updated_at, deleted_at (lifecycle)

### sessions
- user_id, ip, user_agent
- last_seen

### dsr_requests
- type (access|erasure|rectification|consent)
- user_email
- status (open|processing|closed|rejected)
- sla, created_at, closed_at
- evidence (JSON blob)

### consent_log
- email, action (given|withdrawn|updated), metadata, ts

## Purposes
- Account management (contractual necessity): core profile fields.
- Security (legitimate interest / legal obligation): sessions, audit trails.
- Compliance (legal obligation): DSR requests, SIEM forwarding.
- Billing (contractual necessity): invoices & payments.
