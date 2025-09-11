# Buoy AI OS v2.4.4 — Placement + MVP Endpoint

## Hva er dette?
En liten, verifiserbar slice som etablerer **Buoy** som første-klasses lag:
- Mappe-struktur + agent-orkestrator
- **POST /buoy/complete** (MVP)
- Koblet til rails: policy → reasoning → actions → explain → event → audit
- Tester + OpenAPI

## Branch og PR
```bash
git checkout -b feat/buoy-2.4.4
# pakk ut i repo-roten
git add .
git commit -m "feat(buoy): OS v2.4.4 placement + /buoy/complete endpoint + tests + openapi"
git push -u origin feat/buoy-2.4.4
```

## Wire ruten
Se `PATCHES/WIRE_BUOY_ROUTE.md` og legg til ruten i `src/server.ts`.

## Kjør tester
```bash
npm ci
npm run typecheck
npm run lint
npm test -- --runTestsByPath tests/buoy/agent.test.ts tests/http/buoyRoutes.test.ts
```

## OpenAPI
Bruk `openapi/buoy.yaml` eller kopier innholdet til deres `openapi/openapi.yaml`.

## Videre
- Legg til faktiske actions og planner-regler.
- Koble Buoy til CRM/Tasks/Log etter policy (0–2).
