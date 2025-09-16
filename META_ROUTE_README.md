# META Routes (Contracts)
Contract-first spec lives in `openapi/meta.yaml`. Seven read-only endpoints:
- `GET /meta/health` _(public)_
- `GET /meta/readiness`
- `GET /meta/version` _(public)_
- `GET /meta/capabilities`
- `GET /meta/policy`
- `GET /meta/audit-stats`
- `GET /meta/metrics`
Security:
- Public: `/meta/health`, `/meta/version`
- Auth (`meta:read`): others
Semantics:
- Never 500 on probe failures; payload encodes status.
- Readiness always 200 with status field.
