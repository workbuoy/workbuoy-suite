# Release / DevOps README

## Lokal dev (fresh machine)
1. `cp .env.example .env`
2. `docker compose up --build`

Dette starter:
- Postgres på `localhost:5432`
- Backend på `http://localhost:3000`
- Frontend på `http://localhost:5173`

## Verifisering
- Health: `curl -s http://localhost:3000/api/meta/health`
- Frontend: åpne `http://localhost:5173`

## CI minimum
CI skal alltid validere:
- `npm run lint`
- `npm run typecheck`
- `npm test`

## Deploy-minimum
- Bygg backend/frontend artifacts.
- Kjør database-migrasjoner før app-rollout.
- Rull ut med healthchecks aktivert.
- Verifiser API health + grunnleggende UI-path etter deploy.
