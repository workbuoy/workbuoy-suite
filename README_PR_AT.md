# PR AT: E2E Green Path – full suite smoke

## Innhold
- **Server**: `scripts/mock_suite_api.js` (CRM + compliance + metrics + webhook-queue)
- **Desktop**: `desktop_demo/offline_sync_demo.js`
- **Connectors**: `scripts/mock_connector_ingest.js`
- **Runner**: `scripts/e2e_green_path.sh`
- **CI**: `.github/workflows/e2e-green.yml`
- **Docs**: `docs/E2E_GREEN.md`

## Kjappstart
```bash
./scripts/e2e_green_path.sh
```

## Artefakt
- `reports/e2e_green.json` – sanntidsoppsummering av kontroller.

## Rollback
- Fjern workflow/skript; behold mock for lokal helsesjekk ved behov.
