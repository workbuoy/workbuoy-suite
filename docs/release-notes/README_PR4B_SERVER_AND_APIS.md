# PR4 (Alt B) — Server bootstrap + CRM/Tasks/Log APIs (in-memory) + Buoy echo + EventBus + Audit

## Hva som inngår
- Full server-bootstrap (`apps/backend/src/server.ts`, `src/bin/www.ts`) med riktig middleware-rekkefølge.
- **Policy V2** guard som nekter write når `x-autonomy-level < 2` (403 med `explanations[]`).
- **EventBus** (priority + DLQ minimal) og dev-inspeksjon `/api/_debug/dlq`.
- **Audit hashchain** (append + verify) koblet på skrive-paths.
- **CRM** `/api/crm/contacts` (GET/POST/DELETE), **Tasks** `/api/tasks` (CRUD), **Log** `/api/logs` (GET/POST).
- **Buoy** `POST /buoy/complete` (echo for MVP) + event + audit.
- **E2E supertest**-røyk for bootstrap og alle features.

## Kjøring
- Test: `npm test` (eller prosjektets testscript).
- Start: `node dist/src/bin/www.js` (etter build) eller `ts-node src/bin/www.ts` i dev.

## Videre
- Bytt in-memory stores til Postgres via Prisma/Drizzle i egen PR.
- Utvid Buoy til faktisk planner/actions; behold policy først.
- OpenAPI specs og lint kan legges i påfølgende PR.

## Commit-forslag
```
feat(server): bootstrap app & routes; add policy v2 guard, event bus, audit chain; implement CRM/Tasks/Log in-memory; add buoy echo; add e2e smoke
```
