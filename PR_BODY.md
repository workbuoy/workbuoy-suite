# feat(backend): CRM write policy + 403 explanations (PR-29)

**Hva**
- `policyGuardWrite` middleware.
- `/api/crm/contacts` (GET/POST/DELETE) med policy på write-ruter.

**Hvordan teste**
- Uten `X-WB-Autonomy` (eller 0): POST/DELETE gir 403 + explanations.
- Med `X-WB-Autonomy: 1`: POST=201, DELETE=204.

**Risiko/rollback**
- Isolert router. Fjern mount for rollback.