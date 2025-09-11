# Database setup (Postgres + Prisma)

## 1) Start Postgres locally
```
cp .env.example .env
docker compose up -d db
```

## 2) Install deps
```
npm i -D prisma
npm i @prisma/client
```

## 3) Generate client & create schema
```
npx prisma generate
npx prisma db push
# or use migrations:
# npx prisma migrate dev --name init
```

## 4) (Optional) Seed script
Create `prisma/seed.ts`:
```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.contact.create({ data: { name: "Alice", email: "alice@example.com" }});
}
main().finally(() => prisma.$disconnect());
```
Run: `npx ts-node prisma/seed.ts`

## 5) Wire repositories (optional now)
- Replace in-memory stores with Prisma repos:
  - `src/features/crm/contacts.route.ts` → use `contacts.repo.ts`
  - `src/features/tasks/tasks.route.ts` → use `tasks.repo.ts`
  - `src/features/log/log.route.ts`    → use `log.repo.ts`

## 6) CI note
- For unit tests, keep DB calls behind a repo interface and mock in tests.
- For integration pipeline with DB, start a service container (Postgres) in Actions or use neon.tech/free plan.
