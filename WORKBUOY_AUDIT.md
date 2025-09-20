## Pillar coverage
| Pillar | Status | Highlights |
| --- | --- | --- |
| Core | ✅ Present | Express CRM CRUD with RBAC audit logging anchors the domain API surface.【F:backend/src/app.ts†L1-L88】 |
| Flex | ✅ Present | Dynamics connector orchestrates OAuth/mapping/metrics while the TS SDK wraps CRM endpoints for integrators.【F:connectors/dynamics/connector.js†L1-L39】【F:sdk/ts/workbuoy.ts†L1-L21】 |
| Secure | ✅ Present | Secure bootstrap enables helmet/CORS/rate limiting and META scope checks on protected routes.【F:backend/src/app.secure.ts†L1-L22】【F:backend/meta/security.ts†L1-L21】 |

| Navi | ✅ Present | Flip-card stitches Buoy chat with Navi grid, exposes keyboard flip controls, and surfaces introspection/health badges.【F:frontend/src/components/FlipCard.tsx†L1-L52】【F:frontend/src/features/navi/NaviGrid.tsx†L1-L74】 |
| Buoy AI | ✅ Present | Single agent builds request context and runs plan/execute pipeline consumed by the chat UI.【F:src/buoy/agent.ts†L1-L95】【F:frontend/src/features/buoy/useBuoy.ts†L1-L18】 |
| Roles | ✅ Present | Role registry composes feature caps from seeded profiles and drives role-aware proactivity APIs.【F:src/roles/registry.ts†L1-L49】【F:roles/roles.json†L10880-L10915】【F:backend/routes/proactivity.ts†L1-L60】 |
| Proactivity | ✅ Present | Six named modes with degrade rails flow through context builders and telemetry-backed REST endpoints.【F:src/core/proactivity/modes.ts†L1-L170】【F:src/core/proactivity/context.ts†L1-L86】【F:backend/routes/proactivity.ts†L1-L60】 |
| Infra | ✅ Present | Helm deployment, Prometheus alert rules, and a Grafana proactivity dashboard ship with the repo.【F:deploy/helm/workbuoy/templates/deployment.yaml†L1-L22】【F:observability/alerts/workbuoy_alerts.yaml†L1-L10】【F:grafana/dashboards/proactivity.json†L1-L30】 |
| Adoption | ✅ Present | Multi-step onboarding, guarded demo seeding API, and deterministic insight nudges are delivered as code.【F:enterprise/onboarding.js†L1-L23】【F:crm/pages/api/onboarding/demo.ts†L1-L15】【F:src/insights/engine.ts†L1-L59】 |

## Buoy AI (single assistant)
- `src/buoy/agent.ts` is the sole orchestrator: it builds a `BuoyContext`, calls the planner/executor stack, logs events, and returns one explanation payload.【F:src/buoy/agent.ts†L5-L95】
- The chat hook in `frontend/src/features/buoy/useBuoy.ts` seeds a single assistant thread and stubs responses without spinning up parallel agents.【F:frontend/src/features/buoy/useBuoy.ts†L3-L17】
- The analysis tool confirms no plural assistant references in the tree (`plural_hits` is empty).【F:workbuoy-analysis.json†L7300-L7325】

## Navi Flip-card UX
- `frontend/src/components/FlipCard.tsx` renders Buoy (front) and Navi (back) faces with keyboard-driven flips, embeds `IntrospectionBadge`, and shows live health chips in the header.【F:frontend/src/components/FlipCard.tsx†L1-L52】
- `IntrospectionBadge` fetches awareness snapshots (stubbed today) and adjusts UI states; wiring is ready for live data.【F:frontend/src/components/IntrospectionBadge.tsx†L1-L52】【F:frontend/src/api/introspection.ts†L1-L24】
- `NaviGrid` + `useAddonsStore` hydrate the back of the card with manifest-driven tiles, filters, and CRM/O365 panels to emulate contextual navigation.【F:frontend/src/features/navi/NaviGrid.tsx†L1-L74】【F:frontend/src/features/addons/AddonsStore.ts†L20-L76】

## Proactivity modes
- `src/core/proactivity/modes.ts` enumerates the six required modes (usynlig→tsunami) with copy, UI hints, and degrade rail definitions.【F:src/core/proactivity/modes.ts†L1-L145】
- `buildProactivityContext` composes subscription caps, role feature caps, and policy overrides into an effective mode with traceable basis strings.【F:src/core/proactivity/context.ts†L1-L86】
- `backend/routes/proactivity.ts` exposes GET/POST APIs that resolve requested vs effective modes per tenant/role, logging telemetry via `logModusskift`.【F:backend/routes/proactivity.ts†L1-L60】【F:src/core/proactivity/telemetry.ts†L1-L24】
- Proactivity data also powers Grafana dashboards and enterprise config presets (e.g., `core.config.json`), showing the modes are baked into config and observability layers.【F:grafana/dashboards/proactivity.json†L1-L30】【F:enterprise/public/config/core.config.json†L1-L44】


## Meta rails
- `backend/meta/router.ts` instruments every META endpoint with rate limits, `meta:read` scope enforcement, and histogram logging for metrics collection.【F:backend/meta/router.ts†L1-L123】【F:observability/metrics/meta.ts†L76-L118】
- The `metaGenesisRouter` (exposed under `/genesis/*`) serves awareness snapshots, proposal scaffolding, and strictly requires `.evolution/APPROVED` before acknowledging evolution implementation, responding with a manual checklist instead of merging anything automatically.【F:src/routes/genesis.autonomy.ts†L70-L118】
- META observability is backed by Prometheus counters/histograms and Grafana dashboards documented in `META_ROUTE_RUNBOOK.md`, aligning with the platform’s “rails” expectations.【F:observability/metrics/meta.ts†L1-L129】【F:META_ROUTE_RUNBOOK.md†L1-L60】


## Roles
- The seeded role library (`roles/roles.json`) captures domains, KPIs, autonomy caps, and policy hints consumed by runtime services.【F:roles/roles.json†L10880-L10915】
- `RoleRegistry` resolves inherited roles, tenant overrides, and feature caps; it is wired directly into proactivity APIs and feature activation routes.【F:src/roles/registry.ts†L1-L49】【F:backend/routes/proactivity.ts†L1-L33】【F:backend/routes/features.ts†L1-L16】
- Capability execution uses `runCapabilityWithRole` to enforce policy and proactivity behavior per resolved caps, linking role context back to Buoy AI/autonomy flows.【F:src/core/capabilityRunnerRole.ts†L1-L79】


## Infra & observability
- The Helm chart (`deploy/helm/workbuoy`) and Kubernetes deployment manifest set up container images, env vars, and services for cluster operation.【F:deploy/helm/workbuoy/templates/deployment.yaml†L1-L22】
- Prometheus alerting (`observability/alerts/workbuoy_alerts.yaml`) and Grafana dashboards (e.g., `grafana/dashboards/proactivity.json`) provide telemetry for API health and autonomy degradations.【F:observability/alerts/workbuoy_alerts.yaml†L1-L10】【F:grafana/dashboards/proactivity.json†L1-L30】
- META metrics expose counters/histograms via `observability/metrics/meta.ts`, ensuring telemetry is emitted even when Prometheus is absent (no-op fallbacks).【F:observability/metrics/meta.ts†L1-L129】

## Adoption
- The enterprise onboarding wizard walks operators through account creation, plan selection, connector setup, and provides progress affordances.【F:enterprise/onboarding.js†L1-L23】
- `crm/pages/api/onboarding/demo.ts` seeds demo data only when `WB_DEMO_ENABLE` is true and the caller passes `requireWriteRole`, illustrating guardrails on onboarding flows.【F:crm/pages/api/onboarding/demo.ts†L1-L15】
- The insights engine emits deterministic nudges with recommendations and policy rationale, ready to surface in Navi or Buoy chips.【F:src/insights/engine.ts†L1-L59】

## Violations
- `enterprise/pages/api/meta/apply.js` writes patches directly to disk from an HTTP handler, breaching the “no git/fs writes from HTTP” rail.【F:enterprise/pages/api/meta/apply.js†L1-L21】【F:workbuoy-analysis.json†L7327-L7333】
- `enterprise/pages/api/wb2wb/policy.update.js` persists tenant policy JSON via `fs.writeFileSync` inside a Next.js API route, also violating the rails requirement.【F:enterprise/pages/api/wb2wb/policy.update.js†L1-L25】【F:workbuoy-analysis.json†L7334-L7338】

## What’s next
- [ ] Move the meta patching/policy update flows behind CLI or queue processors so HTTP routes no longer perform filesystem writes.【F:enterprise/pages/api/meta/apply.js†L1-L21】【F:enterprise/pages/api/wb2wb/policy.update.js†L1-L25】【F:workbuoy-analysis.json†L7327-L7338】
- [ ] Replace the stubbed `fetchIntrospectionReport` with calls to the live `metaGenesis` endpoints to surface real awareness snapshots in the flip-card header.【F:frontend/src/api/introspection.ts†L1-L24】【F:src/routes/genesis.autonomy.ts†L77-L118】
- [ ] Extend Buoy’s runtime (`runCapabilityWithRole` + connectors) to power the chat surface instead of the hard-coded stub responses, closing the loop between agent actions and backend capabilities.【F:src/core/capabilityRunnerRole.ts†L14-L79】【F:frontend/src/features/buoy/useBuoy.ts†L3-L17】
- [ ] Apply the `.evolution/APPROVED` gate or retire the legacy `/api/meta-evolution` POST handlers that currently simulate evolution without approval checks.【F:backend/src/meta-evolution/routes/evolution.routes.ts†L13-L74】
