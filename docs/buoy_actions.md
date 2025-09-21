# Buoy OpenAPI Action Layer

- Allowlist: `ai/policy/tool_allowlist.yaml` definerer hvilke metoder og paths Buoy kan kalle.
- Konfigurasjon:
  - `BUOY_OPENAPI_PATH` (default `openapi/openapi.yaml`)
  - `BUOY_ACTION_ALLOWLIST` (default `ai/policy/tool_allowlist.yaml`)
  - `BUOY_ACTION_BASE_URL` (default `http://localhost:3000`)
  - `BUOY_ACTION_API_KEY` (valgfri `x-api-key` header)
- Planneren mappe intensjoner (`crm.contacts.list`, `geo.geocode`, m.fl.) til `openapi.call`.
- `runTool` legger på `Idempotency-Key` og JSON-body og parser respons med fallback til tekst.
- Bruk `plan(intent, ctx, params)` for å generere plan, der `params` kan angi `method`/`path` eksplisitt.
