# Workbuoy — Architecture (delta-mode snapshot)

## Request flow — `/buoy/complete`
```mermaid
sequenceDiagram
  autonumber
  participant UI as UI
  participant API as Express
  participant POL as policyGuard
  participant AG as Buoy Agent
  participant EX as Explain
  participant EV as EventBus
  participant AU as Audit

  UI->>API: POST /buoy/complete {intent, params}<br/>headers: x-autonomy, x-role-id, x-correlation-id
  API->>POL: requestContext + policyV2Guard(category=read|write)
  POL-->>API: allow|deny (headers: x-policy-*)
  API->>AG: agent.run()
  AG->>EX: buildExplanation (template, fast)
  AG->>EV: emit buoy.action.executed (priority: low)
  AG->>AU: append audit entry (batched 50ms)
  AG-->>API: { result, explanations[], confidence, correlationId }
  API-->>UI: 200 OK (or 403 with explanations)
```

## Headers & contracts
- `x-autonomy: 0|1|2`, `x-role-id`, `x-correlation-id` (optional; server will generate)
- Responses include `correlationId` and `explanations[]` on deny/degrade.

## Rails tags in code
Use these machine-readable comments:
```ts
// RAIL:ENTRYPOINT <name>
// RAIL:SIDE_EFFECT <what>
// RAIL:RETURN <shape>
```
