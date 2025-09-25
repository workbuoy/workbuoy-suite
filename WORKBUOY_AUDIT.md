# Workbuoy Audit (commit fcfe06e)

## Pillar coverage

| Pillar | Status | Notes |
| --- | --- | --- |
| Core | ✅ Present | Backend services and CRM APIs remain wired up for the base experience. Key files: `backend/src/app.ts`, `src/routes/genesis.autonomy.ts`, `services/builder/builder.ts`. |
| Flex | ✅ Present | Connector SDKs and integration examples keep the platform extensible. Key files: `connectors/dynamics/connector.js`, `sdk/ts/workbuoy.ts`, `examples/js_quickstart.js`. |
| Secure | ✅ Present | Security modules and policy guards keep governance and approvals in place. Key files: `backend/meta/router.ts`, `backend/src/meta-evolution/routes/evolution.routes.ts`, `META_ROUTE_RUNBOOK.md`. |
| Navi | ✅ Present | Flip-card UI and Navi modules expose the workspace navigation surfaces. Key files: `frontend/src/components/FlipCard/FlipCard.tsx`, `frontend/src/navi/NaviGrid.tsx`, `frontend/src/components/FlipCard/FlipCard.css`. |
| Buoy AI | ✅ Present | Single-assistant orchestration and chat UX live in buoy source modules. Key files: `src/buoy/agent.ts`, `frontend/src/features/buoy/useBuoy.ts`, `frontend/src/features/buoy/ChatMessage.tsx`. |
| Roles | ✅ Present | Role registries and UI presenters surface tone, priority, and policy chips. Key files: `packages/roles-data/roles.json`, `src/roles/registry.ts`, `frontend/src/roles/rolePresentation.ts`. |
| Proactivity | ✅ Present | Mode definitions and UI keep proactivity controls available. Key files: `src/core/proactivity/modes.ts`, `frontend/src/proactivity/useProactivity.ts`, `frontend/src/proactivity/ModeSwitcher.tsx`. |
| META | ✅ Present | META routers, genesis flows, and guard specs stay enforced. Key files: `src/routes/genesis.autonomy.ts`, `backend/meta/router.ts`, `tests/meta/meta-rails.test.ts`. |
| Infra | ✅ Present | Deploy and observability assets remain packaged with the suite. Key files: `deploy/helm/workbuoy/templates/deployment.yaml`, `observability/metrics/meta.ts`, `grafana/dashboards/proactivity.json`. |
| Adoption | ✅ Present | Onboarding flows and samples demonstrate adoption tooling. Key files: `enterprise/onboarding.js`, `crm/pages/api/onboarding/demo.ts`, `samples/contacts.csv`. |

## Buoy AI (one assistant)

- `src/buoy/agent.ts` orchestrates the request context and plan/execute pipeline, returning a single assistant response each turn.
- `frontend/src/features/buoy/useBuoy.ts` maintains one Buoy AI thread for the chat surface, keeping the assistant singular.
- Analyzer signals: 30 singular mentions recorded, 0 plural hits (must stay at 0).

## Navi Flip-card UX

- `frontend/src/components/FlipCard/FlipCard.tsx` renders Buoy on the front and Navi on the back with keyboard flips, resize nudges, and connect dialogs.
- `frontend/src/components/FlipCard/FlipCard.css` keeps the 3D transform in production while only muting transitions for reduced motion.
- `frontend/src/navi/NaviGrid.tsx`, `frontend/src/features/buoy/BuoyChat.tsx`, and `frontend/src/components/FlipCard/FlipCard.test.tsx` ensure Buoy ⇄ Navi wiring stays accurate.

## Proactivity UI

- `frontend/src/proactivity/useProactivity.ts` syncs requested vs. effective modes, degrade rails, and telemetry calls.
- `frontend/src/proactivity/ModeSwitcher.tsx` renders the multi-mode selector with pending, approval, and error states.
- `frontend/src/proactivity/ApprovalPanel.tsx` surfaces manual approval UI so operators can gate proactivity changes.

## META rails

- `backend/meta/router.ts` enforces scopes, rate limits, and telemetry on META endpoints.
- `src/routes/genesis.autonomy.ts` keeps proposals-only behavior and requires `.evolution/APPROVED` tokens before acknowledging evolution.
- Guard coverage spans `tests/meta/meta-rails.test.ts` and `ci/policy-meta-rails.sh`, and the analyzer flags any git./fs. usage inside META HTTP handlers.

## Roles in UI

- `packages/roles-data/roles.json` seeds tone, priority, and policy chips for each persona.
- `frontend/src/roles/rolePresentation.ts` renders those role chips and guidance for UI consumption.
- `frontend/src/features/buoy/ChatMessage.tsx` displays assistant vs. user roles alongside rationale drawers.

## Infra & observability quick note

- `deploy/helm/workbuoy/templates/deployment.yaml` ships a Kubernetes deployment wired for metrics.
- `observability/metrics/meta.ts` exposes META counters and histograms for Prometheus and Grafana.
- `grafana/dashboards/proactivity.json` visualises proactivity adoption and degrade rails for operators.

## What's next

- [ ] Move filesystem or git usage out of META HTTP route `enterprise/pages/api/meta/apply.js:18` – fs.writeFileSync(out, JSON.stringify({ id, patch, applied_at: new Date().toISOString() }, null, 2));.
- [ ] Move filesystem or git usage out of META HTTP route `enterprise/pages/api/wb2wb/policy.update.js:20` – fs.writeFileSync(storePath, JSON.stringify(data,null,2));.

