# WorkBuoy CRM & Desktop – Quickstart (PR AQ)

Målet er å gå fra **API-key → webhook → CRM CRUD → Desktop offline→sync** på 15–25 minutter.
Guiden bruker en **mock CRM backend** og hodeløs **desktop sync-demo** for å validere flyten lokalt.

```
        +-----------------+          POST /contacts           +----------------------+
        | Desktop (offline) |  ───────── enqueue ─────────▶   |  Local queue (.json) |
        +-----------------+                                   +----------------------+
                  │                                                   │
                  │ syncOnce()                                        │
                  ▼                                                   │
        +-----------------+     PATCH/POST /api/v1/crm/*     +----------------------+
        |   Mock CRM API  |  ◀─────────────── HTTP ─────────▶ |  Webhook receiver *  |
        +-----------------+                                   +----------------------+
           * valgfritt for demo
```

## Forutsetninger
- Node.js ≥ 18
- Python ≥ 3.9
- `bash` (for smoke-skriptet)

## 1) Miljøvariabler
Sett disse (tilpasses din backend dersom ikke mock):
```bash
export BASE_URL=http://127.0.0.1:45860
export API_KEY=dev
export TENANT_ID=t1
```

## 2) Start Mock CRM API (lokalt)
```bash
node scripts/mock_crm_api.js
```
Mocken eksponerer minimal CRM:
- `POST /api/v1/crm/contacts` (201)
- `GET /api/v1/crm/contacts/:id`
- `PATCH /api/v1/crm/contacts/:id`
- (Webhook stub: POST /webhook sinks payloads til stdout)

## 3) Kjør CRM-CRUD (JS)
```bash
cd examples/js
npm ci
node crm_crud.js
```
Skriptet skriver ut opprettet kontakt, oppdatert kontakt og henter den tilbake.

## 4) Kjør CRM-CRUD (Python)
```bash
cd ../python
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python crm_crud.py
```

## 5) Desktop: Offline → Sync demo
```bash
cd ../../desktop_demo
node offline_sync_demo.js
```
Flyt:
1. **Offline**: enqueuer en ny kontakt til `.wb_cache.json` (ingen nettverkskall).
2. **Online**: kall `syncOnce()` – pending-oppføringer POSTes til CRM og markeres som synket.

Output viser antall pending før/etter samt id-er opprettet i mock-API.

## 6) Troubleshooting
- **403 RBAC**: Sjekk `x-user-role`-headers i mock (`scripts/mock_crm_api.js` setter `admin`). I prod kreves korrekt RBAC/SSO-claims.
- **Webhook ikke levert**: Mocken logger til stdout. I prod verifiser `X-WB-Signature` og retry-backoff.
- **Desktop cache**: Slett `desktop_demo/.wb_cache.json` for ren test.
- **Redis**: Ikke nødvendig for denne demoen. Produksjons-sync kan bruke Redis-kø (se egne PR-er).

## 7) Røyk-test i ett steg
```bash
./scripts/quickstart_smoke.sh
```
Skriptet starter mock-API, kjører JS & Python CRUD og desktop sync, og feiler hvis noe ikke svarer 2xx.

## Lenker
- Swagger (prod): `https://<din-host>/swagger` (tilpass)
- Dashboards: *CRM webhooks*, *Desktop sync* (se tidligere PR-er)
- SDK-publisering: se `RELEASE_NOTES_SDK.md` og `docs/SDK_PUBLISHING.md`
