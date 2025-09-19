# UI Integration for Proactivity

1. Call `GET /api/proactivity/state` on app bootstrap (headers: `x-tenant`, `x-user`, `x-role`). Store the response in UI state.
2. Subscribe to user actions that request higher modes (e.g. "Go hands-free"). POST the desired `requestedMode` to `/api/proactivity/state` and re-render with the response.
3. Use `uiHints`:
   - `banner`: copy for lightweight toasts or inline alerts.
  - `callToAction`: label for CTA buttons. If absent, hide the CTA.
  - `overlay`: when `true`, mount DOM overlays or ghost cursors.
  - `healthChecks`: show status badge and fetch `/metrics` for heartbeat.
4. Read `basis` to populate the Why Drawer. Each string is machine-readable (`subscription:flex`, `cap:policy:proaktiv`). Use the prefix to group reasons.
5. Hit `GET /api/explain/last` when the Why Drawer opens to fetch the last 10 telemetry events. Each event includes the requested/effective keys so you can display "Requested Kraken → Effective Proaktiv (subscription:flex)".
6. When mode >= `ambisiøs`, render approval UX. When >= `kraken`, show execution progress and allow cancel. When `tsunami`, show overlay and health status.
7. Cache the `degradeRail` to inform users what the next safe fallback is.
8. On logout or tenant switch, call `GET /api/admin/subscription` to refresh caps.

All responses are low-latency in-memory. Retry on 503 with exponential backoff and degrade to `proaktiv` in UI if the API is unreachable.
