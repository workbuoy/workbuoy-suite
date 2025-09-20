# Proactivity Modes

Workbuoy automation is orchestrated through six proactivity modes. Each mode controls what the runner is allowed to do and what the UI should surface.

| Level | Keyword   | Summary                                           | Runner Behaviour                               | UI Hooks |
|-------|-----------|---------------------------------------------------|------------------------------------------------|----------|
| 1     | `usynlig` | Observe silently with no UI footprint             | Collect signals only                           | Hide surfaces |
| 2     | `rolig`   | Observe + passive telemetry                       | Emit telemetry, no call-to-action              | Read-only banners |
| 3     | `proaktiv`| Suggest actions with CTA                          | Call `impl.suggest()`                          | Render suggestion chips |
| 4     | `ambisiøs`| Prepare previews pending approval                 | Call `impl.prepare()`                          | Show approval modals |
| 5     | `kraken`  | Execute under policy guardrails                   | Call `impl.execute()`                          | Stream execution log |
| 6     | `tsunami` | Execute + overlay + health checks                 | Call `impl.execute()` then `impl.overlay()`    | Overlay DOM + health badge |

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

The runner logs the resolved basis to `intent` records so the Why Drawer can explain *why* Workbuoy acted (e.g. `['subscription:flex', 'feature:crm_forecaster', 'cap:policy:proaktiv']`).

## Explainability Basis

Basis strings are intentionally terse. Common prefixes:

- `subscription:*` → subscription plan, kill-switch, secure tenant flags
- `feature:<id>` → role feature context used for capability execution
- `cap:<source>:<mode>` → where the cap came from (`subscription`, `role`, `policy`, etc.)
- `requested:<mode>` → original request from UI or headers

Telemetry is stored in-memory and surfaced via `/api/explain/last` (last 10 events) for UI explainability panes.
