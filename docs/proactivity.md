# Proactivity Modes

Workbuoy automation is orchestrated through six proactivity modes. Each mode controls what the runner is allowed to do and what the UI should surface.

| Level | Keyword   | Summary                                           | Runner Behaviour                               | UI Hooks |
|-------|-----------|---------------------------------------------------|------------------------------------------------|----------|
| 1     | `usynlig` | Observe silently with no UI footprint             | Collect signals only                           | Hide surfaces |
| 2     | `rolig`   | Observe + passive telemetry                       | Emit telemetry, no call-to-action              | Read-only banners |
| 3     | `proaktiv`| Suggest actions with CTA                          | Call `impl.suggest()`                          | Render suggestion chips |
| 4     | `ambisiøs`| Prepare previews pending approval                 | Call `impl.prepare()`                          | Flip-card draft surface |
| 5     | `kraken`  | Execute under policy guardrails                   | Call `impl.execute()`                          | Backstage execution feed |
| 6     | `tsunami` | Execute + overlay + health checks                 | Call `impl.execute()` then `impl.overlay()`    | DOM overlay + health badge |

`PROACTIVITY_MODE_META` now exposes a `uiHints.surface` value used by flip-cards:

```
none → passive → cards → draft → backstage → dom-overlay
```

Each mode also advertises a **chip** contract (`{ key, label, icon }`) so the UI can render a compact indicator (🫧, 🌿, 💡, ✍️, 🐙, 🌊).

> **Compat:** legacy autonomy headers (`x-proactivity-compat: 0..3`) map to modern modes:
> `0/1 → 3 (proaktiv)`, `2 → 4 (ambisiøs)`, `3 → 5 (kraken)`.

## Degrade Rails

Degradation follows a fixed rail: `tsunami → kraken → ambisiøs → proaktiv`. When a cap or error forces a downgrade we step along this rail instead of free-falling to zero. Below `proaktiv` we fall back to `rolig` and finally `usynlig` if the tenant kill-switch is flipped.

`degradeOnError(mode)` uses the same rail. Errors encountered in `tsunami` drop to `kraken`, errors in `kraken` drop to `ambisiøs`, etc.

## Subscription, Tenant & Kill Caps

Subscriptions define the ceiling:

- **flex** → `ambisiøs` (4)
- **secure** → `proaktiv` (3)
- **enterprise** → `tsunami` (6)

The `/api/admin/subscription` endpoint lets operations teams change plan, engage a kill-switch (`maxMode` becomes `usynlig`) or mark a tenant as secure-only (forcing the cap back to `proaktiv`). A `maxOverride` can temporarily tighten the ceiling for incident response.

## Effective Mode Resolution

Every proactivity decision now evaluates the minimum across four sources before the runner executes:

1. **Requested mode** – what the caller or UI asked for.
2. **Role & feature caps** – pulled from the role registry (DB-backed when `FF_PERSISTENCE=true`) including tenant overrides (`roleCap:<featureId>=<n>` basis entries).
3. **Subscription plan & tenant flags** – plan ceilings (`tenantPlan:<plan>`) and `secureTenant` enforcement (`tenant<=3`).
4. **Policy guardrails** – optional policy responses that downscope autonomy.

The resolver walks the degrade rail (`tsunami → kraken → …`) until the lowest cap is satisfied. When a downgrade happens we stamp `degraded:<mode>` in the basis so explainability surfaces can render the reason. Kill switches add `kill`, and plan restrictions add `cap:tenantPlan:*` entries.

## Role & Policy Interactions

`policyCheckRoleAware` now evaluates policy with the *effective* proactivity mode. Role feature caps still apply: the registry resolves feature autonomy caps, and the cap is injected into the resolution pipeline. Policy guardrails can provide their own caps by returning a lower `policyCap`, which folds into the degrade rail before execution.

The runner logs the resolved basis to `intent` records so the Why Drawer can explain *why* Workbuoy acted (e.g. `['mode:requested=6', 'mode:effective=4', 'tenantPlan:flex', 'roleCap:crm=3', 'degraded:subscription']`).

### Approval flow (Ambisiøs/4)

Mode `ambisiøs` no longer executes. Instead the runner:

1. Calls `impl.prepare()` and captures the preview payload.
2. Persists a `proposal` record with status `proposed` (tenant, feature, capability, payload, preview, basis, idempotency key).
3. Emits `proposal.created` on the event bus.
4. Returns `{ proposalId, preview, basis }` to the caller.

Approvers call `POST /api/proposals/{id}/approve` (requires Kraken/≥5). The server marks the proposal `approved`, executes the capability with connector idempotency safeguards, updates the record to `executed`/`failed` and emits lifecycle events. `POST /api/proposals/{id}/reject` transitions directly to `rejected` without execution.

## Explainability Basis

Basis strings are intentionally terse. Common prefixes:

- `mode:requested=<n>` / `mode:effective=<n>` → numeric modes after compat mapping and caps
- `tenantPlan:<plan>` → subscription plan context
- `tenant<=3` → secure tenant restriction
- `roleCap:<feature>=<n>` / `policyCap:<source>=<n>` → autonomy caps applied
- `degraded:<source>` → which guard forced a downgrade (`subscription`, `role:crm`, `policy`, `kill`, etc.)
- `guard:min=<n>` → HTTP guard requirement when a request was denied

Telemetry is stored in-memory and surfaced via `/api/explain/last` (last 10 events) for UI explainability panes.
