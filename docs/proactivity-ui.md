# Proactivity UI

## Modes
The UI exposes the six backend proactivity modes:

| Key | Label | Behaviour | Requires approval? |
| --- | --- | --- | --- |
| `usynlig` | Usynlig | Silent observation | No |
| `rolig` | Rolig | Passive telemetry | No |
| `proaktiv` | Proaktiv | Suggestions with CTA buttons | No |
| `ambisiøs` | Ambisiøs | Prepares previews and waits for approval | Yes |
| `kraken` | Kraken | Executes automations under guardrails | Yes |
| `tsunami` | Tsunami | Full automation with overlays/health checks | Yes |

## UI behaviour
- Buttons reflect the requested mode via `aria-pressed`. The effective mode is highlighted with a subtle border.
- Selecting Ambisiøs/Kraken/Tsunami opens the approval dialog. The operator must:
  - Describe why escalation is needed.
  - Explicitly tick the approval checkbox.
  - Confirm via “Approve mode change”.
- Without approval the POST still happens but the backend responds with `effectiveKey: proaktiv`; the UI keeps the guard chip visible (`Mode: Assistive`).
- Once approved the chip updates to the appropriate badge (`Mode: Approval` or `Mode: Execution`) and the global context updates `window.__WB_CONTEXT__.autonomyLevel`.

## API payloads
`GET /api/proactivity/state` returns the server-computed context:
```json
{
  "tenantId": "demo",
  "requestedKey": "proaktiv",
  "effectiveKey": "proaktiv",
  "basis": ["policy:approved"],
  "uiHints": {
    "banner": "Suggestions ready",
    "reviewType": "suggestion",
    "callToAction": "See suggestions"
  }
}
```

`POST /api/proactivity/state` expects:
```json
{
  "requested": "kraken",
  "approved": true,
  "reason": "Pilot automation"
}
```
The backend mirrors the response shape from `GET` with updated `requestedKey` / `effectiveKey`.

## Telemetry
The hook emits `proactivity_mode_change` events via `window.__WB_TELEMETRY__?.track` (falls back to `console.info`). Payload: `{ mode, approved, reason? }`.
This ensures mode transitions reach downstream observability without leaking content.

## Do / don’t
- **Do** surface the guard chip returned by the backend; it communicates degrade rails and pending approvals.
- **Do** persist the last known mode in the client (the hook caches the latest response).
- **Do** gate high modes behind explicit approval in the UI and relay the operator’s reason to the backend.
- **Don’t** auto-escalate without showing the dialog.
- **Don’t** bypass the backend response—always respect the server’s `effectiveKey` even after approval.
