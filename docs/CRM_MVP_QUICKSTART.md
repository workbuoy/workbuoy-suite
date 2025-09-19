# WorkBuoy CRM MVP Quickstart

This guide brings the WorkBuoy API online together with seed data so the CRM MVP can be exercised end-to-end.

## Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for running the optional frontend dev server)

## 1. Install dependencies (one time)
```bash
npm install --prefix backend
npm install --prefix frontend
```

## 2. Launch the stack
Start the API (and Postgres for optional extensions) with Compose:
```bash
docker compose up app
```
This will:
- build the API image
- mount the repository for live reloads
- expose the API at http://localhost:3000

In a separate terminal you can start the frontend:
```bash
npm run dev --prefix frontend
```

## 3. Seed demo data via API
With the API running, create a contact and a task using the authenticated headers required by policy v2:
```bash
curl -XPOST http://localhost:3000/api/crm/contacts \
  -H 'x-autonomy-level:2' -H 'x-role:ops' -H 'content-type: application/json' \
  -d '{"name":"Demo Contact","email":"demo@example.com"}'

curl -XPOST http://localhost:3000/api/tasks \
  -H 'x-autonomy-level:2' -H 'x-role:ops' -H 'content-type: application/json' \
  -d '{"title":"Try Workbuoy","status":"todo"}'
```

## 4. Smoke checks
```bash
curl -s http://localhost:3000/status | jq .
curl -s http://localhost:3000/metrics | head
curl -s http://localhost:3000/_debug/bus | jq .
```

The UI can now load the CRM panel via http://localhost:5173 (default Vite dev port).

## Tear down
```bash
docker compose down
```
Data created through the API persists to `./data/` when `PERSIST_MODE=file` (default).
