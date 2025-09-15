# feat(backend): /core/complete stub + Why-kontrakt (PR-28)

**Hva**
- `POST /core/complete` som svarer med `text` + `explanations[]`.
- Enkelt autonomy-sjekk → `403` med forklaringer.

**Hvordan teste**
- `curl -X POST /core/complete -H "X-WB-Intent: contacts.create" -H "X-WB-Autonomy: 0" -d '{"text":"lag kontakt"}'`
- Forvent `403` med `explanations`.

**Risiko/rollback**
- Isolert rute. Fjern mount for rollback.