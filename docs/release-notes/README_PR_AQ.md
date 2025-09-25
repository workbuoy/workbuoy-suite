# PR AQ: Quickstart – CRM & Desktop

## Innhold
- **Docs**: `docs/CRM_DESKTOP_QUICKSTART.md`
- **Mock API**: `scripts/mock_crm_api.js`
- **Eksempelkode**:
  - JS: `examples/js/crm_crud.js`
  - Python: `examples/python/crm_crud.py`
  - Desktop demo: `desktop_demo/offline_sync_demo.js` (offline queue → syncOnce)
- **Smoke**: `scripts/quickstart_smoke.sh`

## Kommandoer
```bash
# Miljø
export BASE_URL=http://127.0.0.1:45860 API_KEY=dev TENANT_ID=t1

# Start mock og kjør alt
./scripts/quickstart_smoke.sh
```

## Rollback
- Fjern quickstart-filer; behold mock som dev-verktøy om nyttig.
