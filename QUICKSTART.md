# QUICKSTART (10–15 min)

## Krav
- Node.js 20+
- Docker + Docker Compose

## Start alt
```bash
cp .env.example .env
docker compose up --build
```

## Test happy-path
1. Gå til `http://localhost:5173`
2. Verifiser at frontend laster data via `/api` (Vite proxy -> backend).
3. Verifiser backend health:
   ```bash
   curl -s http://localhost:3000/api/meta/health
   ```

## Nyttige kommandoer
```bash
npm run lint
npm run typecheck
npm test
npm run meta -- --suggest
```
