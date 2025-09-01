# WorkBuoy CRM SDK – Quickstart

## Forutsetninger
- Backend fra PR B kjører lokalt på `http://localhost:3000`
- API-key for dev: `dev-123` (kun lokalt)

## JS/TS SDK
```bash
cd sdk/js
npm ci
npm run build
node -e "import('./dist/index.js').then(async m => { const c = new m.WorkBuoy({baseUrl:'http://localhost:3000', apiKey:'dev-123', tenantId:'demo-tenant'}); console.log(await c.contacts.list({limit:1})); });"
```

## Python SDK
```bash
cd sdk/python
python -m venv .venv && source .venv/bin/activate
pip install -e .
python -c "from workbuoy import WorkBuoy; c=WorkBuoy('http://localhost:3000','dev-123','demo-tenant'); print(c.contacts.list(1))"
```

## Feilsøking
- **401 Unauthorized**: manglende/feil `x-api-key`
- **400 Missing Idempotency-Key**: mutasjoner krever `Idempotency-Key` header
- **429**: vent og forsøk igjen
