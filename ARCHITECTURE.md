# ARCHITECTURE

## Komponentdiagram (tekst)
- Frontend (`apps/frontend`, Vite/React)
  - snakker med backend via `/api` og `/core` (proxy i dev)
- Backend (`apps/backend`, Express)
  - eksponerer API-ruter, auth, policy, observability
  - bruker Postgres via Prisma
- Database (Postgres)
  - migrasjoner + seed kjøres ved oppstart i compose-dev
- Shared packages (`packages/*`)
  - UI-komponenter og backend-funksjonalitet gjenbrukes av apps

## Dataflyt (kort)
1. Bruker åpner frontend.
2. Frontend kaller backend API (`/api/*`).
3. Backend validerer request, auth/policy og leser/skriver DB.
4. Backend returnerer konsistent JSON-respons som rendres i UI.
