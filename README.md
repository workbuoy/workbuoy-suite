# Workbuoy Meta Safeguards

This branch adds a lightweight meta-control layer that exposes awareness signals,
autonomous development proposals and explicit evolution guardrails across the
Workbuoy stack.

## Modules

- **Introspection report** – `GET /genesis/introspection-report` exposes the
  latest awareness score together with a structured introspection report. The
  frontend now renders the score through the new `IntrospectionBadge` component
  in the flip-card header.
- **Autonomous development proposals** – `POST /genesis/autonomous-develop`
  only returns planning suggestions (`mode: "proposal"`). It never writes to the
  repository and provides context-aware checklists for operators.
- **Evolution gatekeeper** – `POST /genetics/implement-evolution` enforces
  manual approval via the `.evolution/APPROVED` token and responds with a manual
  checklist instead of merging.

## Safety rails

- `.evolution/APPROVED` must exist for any evolution request to be accepted.
  Without the token the endpoint returns `403 approval_required`.
- Even with approval the evolution endpoint simply acknowledges the request and
  describes the manual merge steps; no git actions are triggered from HTTP.
- The autonomous develop endpoint emits suggestions only and references the
  awareness snapshot so operators can review the context before acting.

## Local development

1. Install dependencies:
   - `npm install --prefix backend`
   - `npm install --prefix frontend`
2. Run checks from the repo root:
   - `npm test` runs the backend Jest suite with mocks for `prom-client` and
     `jsonwebtoken`.
   - `npm run typecheck` verifies both backend (`tsc --noEmit`) and frontend
     TypeScript sources via the shared `tsconfig.json` that includes
     `backend/src` and `frontend/src`.
3. Start the UI for manual testing: `npm run dev --prefix frontend`.

The new endpoints are mounted through `src/server.ts`, so running the backend
server exposes `/genesis/*` and `/genetics/*` alongside existing APIs.
