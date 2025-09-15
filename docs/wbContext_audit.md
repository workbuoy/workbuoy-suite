# wbContext + Audit (PR-27)

- Middleware `wbContext` leser `X-WB-*` headere og legger verdier på `req.wb`.
- `POST /api/audit` og `GET /api/audit` (in-memory) for enkel inspeksjon.
- `errorAudit` mapper feil → JSON og logger audit-rad.

Montering: se `server.mount.ctx-audit.patch.txt`.