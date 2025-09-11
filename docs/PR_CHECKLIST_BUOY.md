# PR Checklist — Buoy AI OS v2.4.4 (Placement + Endpoint)

- [ ] `src/buoy/*` added: agent, reasoning, actions, memory
- [ ] POST `/buoy/complete` implemented in `src/core/http/routes/buoy.ts`
- [ ] Router wired in `src/server.ts` (see PATCHES/WIRE_BUOY_ROUTE.md)
- [ ] Uses policy rails: middleware order `requestContext` → `policyGuard` → handler
- [ ] EventBus publish: `buoy.action.executed` (priority: low)
- [ ] Audit append on each action
- [ ] Tests added:
  - [ ] `tests/buoy/agent.test.ts`
  - [ ] `tests/http/buoyRoutes.test.ts`
- [ ] OpenAPI updated: `openapi/buoy.yaml` (or merge into main spec)
- [ ] CI green (typecheck, lint, unit)
