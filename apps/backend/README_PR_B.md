# PR B: CRM CRUD API + Swagger

## Kjøring
```bash
cd backend
cp .env.example .env
npm ci
npm run build
node dist/index.js
```

## Swagger
- Åpne http://localhost:3000/api-docs

## Eksempel-requests
```bash
API=http://localhost:3000
KEY=dev-123
TENANT=demo-tenant

curl -H "x-api-key: $KEY" -H "x-tenant-id: $TENANT" $API/api/v1/crm/pipelines
curl -X POST -H "x-api-key: $KEY" -H "Idempotency-Key: abc" -H "Content-Type: application/json" -d '{"tenant_id":"demo-tenant","name":"Default"}' $API/api/v1/crm/pipelines
```
