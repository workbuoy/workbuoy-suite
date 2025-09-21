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

## Snapshot

![Stacked ladder of proactivity modes with approval cues](data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3NjAgMzYwIj4KICA8cmVjdCB3aWR0aD0iNzYwIiBoZWlnaHQ9IjM2MCIgcng9IjI0IiBmaWxsPSIjMGYxNzJhIiAvPgogIDx0ZXh0IHg9IjM4MCIgeT0iNDQiIGZvbnQtZmFtaWx5PSJJbnRlcixBcmlhbCIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2Y4ZmFmYyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvYWN0aXZpdHkgTW9kZSBMYWRkZXI8L3RleHQ+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjAsODApIj4KICAgIDxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMjAwIiByeD0iMjAiIGZpbGw9IiMxMTFkMzQiIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogICAgPGcgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZGJlYWZlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4KICAgICAgPHRleHQgeD0iODAiIHk9IjQ4Ij5Vc3lubGlnPC90ZXh0PgogICAgICA8dGV4dCB4PSIxODAiIHk9IjQ4Ij5Sb2xpZzwvdGV4dD4KICAgICAgPHRleHQgeD0iMjgwIiB5PSI0OCI+UHJvYWt0aXY8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iNDgiPkFtYmlzacO4czwvdGV4dD4KICAgICAgPHRleHQgeD0iNDgwIiB5PSI0OCI+S3Jha2VuPC90ZXh0PgogICAgICA8dGV4dCB4PSI1ODAiIHk9IjQ4Ij5Uc3VuYW1pPC90ZXh0PgogICAgPC9nPgogICAgPGxpbmUgeDE9IjEyMCIgeTE9IjcwIiB4Mj0iMTIwIiB5Mj0iMjIwIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNiA2IiAvPgogICAgPGxpbmUgeDE9IjIyMCIgeTE9IjcwIiB4Mj0iMjIwIiB5Mj0iMjIwIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNiA2IiAvPgogICAgPGxpbmUgeDE9IjMyMCIgeTE9IjcwIiB4Mj0iMzIwIiB5Mj0iMjIwIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNiA2IiAvPgogICAgPGxpbmUgeDE9IjQyMCIgeTE9IjcwIiB4Mj0iNDIwIiB5Mj0iMjIwIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNiA2IiAvPgogICAgPGxpbmUgeDE9IjUyMCIgeTE9IjcwIiB4Mj0iNTIwIiB5Mj0iMjIwIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNiA2IiAvPgogICAgPHJlY3QgeD0iMjUyIiB5PSI3OCIgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMTQiIGZpbGw9IiMxZTI5M2IiIHN0cm9rZT0iIzM4YmRmOCIgc3Ryb2tlLXdpZHRoPSIzIiAvPgogICAgPHRleHQgeD0iMzAwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJJbnRlcixBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzM4YmRmOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2VsZWN0ZWQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzMDAiIHk9IjE0NCIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYmFlNmZkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9ha3RpdiBtb2RlPC90ZXh0PgogICAgPGcgZmlsbD0iI2YxZjVmOSIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4KICAgICAgPHRleHQgeD0iODAiIHk9IjE2MCI+T2JzZXJ2YXRpb248L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjE4MCIgeT0iMTYwIj5UZWxlbWV0cnk8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjI4MCIgeT0iMTYwIj5TdWdnZXN0aW9uczwvdGV4dD4KICAgICAgPHRleHQgeD0iMzgwIiB5PSIxNjAiPlByZXZpZXcgKyBBcHByb3ZlPC90ZXh0PgogICAgICA8dGV4dCB4PSI0ODAiIHk9IjE2MCI+R3VhcmRlZCBBdXRvbWF0aW9uPC90ZXh0PgogICAgICA8dGV4dCB4PSI1ODAiIHk9IjE2MCI+RnVsbCBBdXRvbWF0aW9uPC90ZXh0PgogICAgPC9nPgogICAgPGcgZmlsbD0iI2ZhY2MxNSIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjEzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4KICAgICAgPHRleHQgeD0iMzgwIiB5PSIxODYiPkFwcHJvdmFsIGRpYWxvZzwvdGV4dD4KICAgICAgPHRleHQgeD0iNDgwIiB5PSIxODYiPkFwcHJvdmFsIHJlcXVpcmVkPC90ZXh0PgogICAgICA8dGV4dCB4PSI1ODAiIHk9IjE4NiI+QXBwcm92YWwgcmVxdWlyZWQ8L3RleHQ+CiAgICA8L2c+CiAgICA8dGV4dCB4PSIzMjAiIHk9IjIxNiIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjY2JkNWY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HdWFyZCBjaGlwIHNob3dzIGVmZmVjdGl2ZSBtb2RlIGZyb20gYmFja2VuZDwvdGV4dD4KICA8L2c+CiAgPHJlY3QgeD0iMTIwIiB5PSIzMDAiIHdpZHRoPSI1MjAiIGhlaWdodD0iNDAiIHJ4PSIyMCIgZmlsbD0iIzFmMjkzNyIgc3Ryb2tlPSIjMzhiZGY4IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPHRleHQgeD0iMzgwIiB5PSIzMjYiIGZvbnQtZmFtaWx5PSJJbnRlcixBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2UwZjJmZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVsZW1ldHJ5IGV2ZW50OiBwcm9hY3Rpdml0eV9tb2RlX2NoYW5nZTwvdGV4dD4KPC9zdmc+)

The inline SVG illustrates the autonomy ladder, highlighting where approval dialogs engage before the backend confirms the effective mode.

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
