# Connectors – Salesforce, HubSpot, Dynamics

Denne modulen leverer **webhooks** + **polling** som importerer data til WorkBuoy CRM.

## Webhook-verifisering (HMAC, dev-friendly)
- Forenklet HMAC-SHA256 over rå body, header-navn per provider:
  - HubSpot: `X-HubSpot-Signature`
  - Salesforce: `X-Salesforce-Signature`
  - Dynamics: `X-Dynamics-Signature`
- Hemmeligheter via env:
  - `CONNECTOR_HMAC_SECRET_HUBSPOT`, `CONNECTOR_HMAC_SECRET_SALESFORCE`, `CONNECTOR_HMAC_SECRET_DYNAMICS`
- I **dev** kan du sette `CONNECTOR_SIGNATURE_BYPASS=1`.

> Merk: Prod-integrasjoner kan kreve providerspesifikk signeringsprotokoll (versjonering/nonce/URL). Denne HMAC-modellen er kompatibel i enterprise-oppsett når webhooken konfigureres til å bruke delt hemmelighet.

## Endepunkt
`POST /api/v1/connectors/{provider}/webhook`  
Body kan være et objekt eller en liste. Respons `202` ved suksess.

## Polling worker
Kjør én batch med:
```bash
node dist/connectors/worker.js
```
Miljø:
- `POLL_PROVIDER` = `hubspot|salesforce|dynamics`
- `POLL_PROVIDER_BASE` = `https://api.<provider>.com/mock`
- `POLL_PROVIDER_TOKEN`
- `CRM_BASE_URL` (f.eks. `http://localhost:3000`)
- `API_KEY`, `TENANT_ID`

## Observability
- `wb_connector_ingest_total{provider,mode}`
- `wb_connector_errors_total{provider,mode}`
- `wb_connector_retries_total{provider}`

## Rollback
Sett env-variabler for å disable provider (unngå å konfigurere webhook/polling) eller fjern Ingress-route.

## Idempotency & Resilience

- **Idempotency-Key** – hver `execute()` må inkludere `Idempotency-Key`. Backend lagrer rader i `connector_calls`
  (`key`, `connector`, `capability_id`, `request_hash`, `status`, `response`, `retries`). Gjentatte kall med samme nøkkel
  returnerer hurtigbufret respons uten å treffe leverandøren igjen.
- **Retry & backoff** – eksponentiell backoff (`250ms * 2^forsøk`) med jitter. Respekter `Retry-After`. Maks fem forsøk,
  hopper over nye forsøk for deterministiske 4xx-feil (unntatt 408/429).
- **DLQ** – etter maks forsøk markeres kallet som `failed` og `eventbus.dlq` emitteres med kontekst (`connector`, `capabilityId`, `key`, `error`).
- **Circuit breaker** – én per connector. Åpner ved flere feil i glidende vindu, går til `half-open` etter cooldown og lukkes på suksess.
  Helseendepunkt: `GET /api/connectors/{name}/health` (`open|half-open|closed`) eller `GET /api/connectors/health` for oversikt.
