# E2E Green Path (PR AT)

Formål: Bekreft at kritiske funksjoner virker sammen – **CRM CRUD**, **Desktop offline→sync**, **Connectors ingest (mock)**, **Observability (metrics)** og **Compliance export/webhooks**.

## Hva kjører
- `scripts/mock_suite_api.js` – samler CRM + compliance + `/metrics` i én prosess.
- `desktop_demo/offline_sync_demo.js` – enqueuer og synker én kontakt.
- `scripts/mock_connector_ingest.js` – simulerer Salesforce & Dynamics ingest.
- `scripts/e2e_green_path.sh` – orkestrerer alt, validerer metrikker og lager `reports/e2e_green.json`.

## Suksesskriterier
- `desktop_sync_ok: true` (kø tom etter sync)
- `connector_sf_ingest_gt0: true` og `connector_dyn_ingest_gt0: true`
- `dlq_clear: true` (0 i DLQ)
- `compliance_export_completed: true`
- `webhooks_ok: true` (startet + fullført webhook-event)

## Kjør lokalt
```bash
chmod +x scripts/e2e_green_path.sh
./scripts/e2e_green_path.sh
cat reports/e2e_green.json
```

## Feilsøking
- Sjekk `reports/*.json` og `reports/metrics.txt`.
- Start services enkeltvis (`node scripts/mock_suite_api.js`) og test endepunkter med curl.
