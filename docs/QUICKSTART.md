# Workbuoy Suite Quickstart

Follow these steps to spin up the local stack with Docker Compose:

1. Copy the environment examples:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Start the services:
   - `docker compose up --build -d`
3. Apply the Prisma schema (or migrations if available):
   - `docker compose exec backend npm run prisma:push`
   - If the project exposes `prisma migrate deploy`, run that instead of `prisma:push`.
4. Seed demo data (only if the seed script exists):
   - `docker compose exec backend npm run seed`
5. Open the frontend at [http://localhost:5173](http://localhost:5173).
6. Access MailHog (if needed) at [http://localhost:8025](http://localhost:8025).
