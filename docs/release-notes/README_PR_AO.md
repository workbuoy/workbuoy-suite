# PR AO: Adaptive Throttling – dynamisk rate limit + backoff

## Endringsplan
- **SDK JS**: `sdk/js/adaptiveClient.js` (token bucket, noteResponse, metrics) + jest test
- **SDK Python**: `sdk/python/workbuoy_adaptive/client.py` + pytest test
- **Integrasjon**: `backend/src/common/README_ADAPTIVE_INTEGRATION.md` – bruk i connectors
- **Docs**: `docs/ADAPTIVE_THROTTLING.md`
- **CI**: `.github/workflows/adaptive-throttling-tests.yml`

## Kjør lokalt
```bash
# JS
cd sdk/js && npm ci && npm test
# Python
cd sdk/python && pip install -e . && pytest -q
```

## Manuell validering
- Test mot et API som returnerer `429 Retry-After` når over QPS.
- Observer at `wb_rate_qps` går ned, og at den gradvis øker ved grønn bane.

## Rollback
- Revert til tidligere HTTP-klient; behold SDK i repo for videre iterasjon.
