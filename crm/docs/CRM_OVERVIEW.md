
## Ingest-pipeline (Fase 2-Alpha)
- **Sources:** Gmail/Calendar/Slack (mock nå, ekte senere)
- **Kontrakt:** `IngestSource{name, pull}` i `lib/crm/ingest/`
- **Behandling:** `runIngest()` mapper events → Company/Contact/Deal i DB
- **Trigger:** `POST /api/ingest/run?source=gmail|calendar|slack` (uten `source` kjører alle)
- **Metrics:** `wb_crm_ingest_events_total{source,kind}`
