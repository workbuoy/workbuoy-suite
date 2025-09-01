# PR M: CRM datamodell + RBAC + Audit

## Endringsplan
- `prisma/schema.prisma` – full CRM-modell
- `src/crm/repo.ts` – repo med audit-linje
- `src/middleware/rbac.ts` – enkel rolle-sjekk
- `src/crm/routes.db.ts` – DB-backed endpoints
- `docs/CRM_DATA_MODEL.md` – migrasjon og bruk

## Sette opp lokalt (Postgres)
```bash
cd backend
npm i -D prisma @prisma/client
npx prisma generate
export DATABASE_URL="postgresql://user:pass@localhost:5432/workbuoy"
npx prisma migrate dev --name init_crm
npm run build && node dist/index.js
```

## Bytte til DB-backed routes
I `src/app.ts` bytt ut `crmRouter` med `crmDbRouter`:
```ts
import { crmDbRouter } from './crm/routes.db.js';
app.use('/api/v1/crm', crmDbRouter);
```

## Rollback
- `npx prisma migrate reset` i dev
- Eller rull tilbake migrasjon i prod; behold gamle endpoints inntil cutover
