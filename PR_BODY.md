# feat(backend): wbContext + audit stub (PR-27)

**Hva**
- `wbContext` middleware (leser `X-WB-*` → `req.wb`).
- `/api/audit` (POST & GET) for enkel audit i dev.
- `errorAudit` som standard error-handler.

**Hvorfor**
- Gjør frontendens kontekst tilgjengelig for policy/audit. Enkel synlighet i dev.

**Hvordan teste**
- Kall en valgfri rute med `X-WB-Intent: demo` → `GET /api/audit` viser raden.
- Provoke feil (kast error i valgfri rute) → `errorAudit` logger med `explanations`.

**Risiko/rollback**
- Isolert middleware og ruter. Fjerner mount for rollback.