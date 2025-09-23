# PR E: Connectors (Salesforce/HubSpot/Dynamics) – webhook + polling

## Kjøring
```bash
cd backend
cp .env.example .env
npm ci && npm run build
node dist/index.js
```

## Webhook test
Se `docs/CONNECTORS.md`.

## Worker
```bash
npm run build
PROVIDER=salesforce TENANT=demo-tenant npm run worker
```

## Feature flag
`CONNECTORS_ENABLED=false` for å deaktivere endpoints.
