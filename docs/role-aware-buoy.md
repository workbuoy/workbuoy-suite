# Role-aware Buoy/Navi UI

## Role context
- The current role is read from `window.__WB_CONTEXT__` (`role`, `roleId`, `roleDisplayName`).
- `useCurrentRole()` normalises this into `{ roleId, displayName, persona }` and listens for `wb:role-changed` events so downstream components update live.

## Presentation mapping
`resolveRolePresentation(roleId)` returns a purely client-side description:

```ts
{
  id: 'sales_manager',
  title: 'Sales Manager',
  tone: 'Confident guidance focusing on team momentum.',
  tagline: 'Buoy AI keeps pipeline risk in focus so you can coach the team before quarter close.',
  policyChips: ['Requires approval before auto-execute', 'Surfaces revenue guardrails'],
  priorityHints: ['Deals slipping 30+ days', ...],
  suggestedEntities: [ { type: 'deal', id: 'deal-4721', label: 'Acme Expansion' }, ... ],
  navigationOrder: ['deal', 'contact', 'task', 'note']
}
```

Roles covered: `sales_manager`, `sales_rep`, `revenue_ops`, `support_lead`, `analyst`, `developer`, with a default `ops` fallback.

## BuoyPanel (front of FlipCard)
- Shows the role tone and tagline so the operator knows how Buoy AI will respond.
- Renders policy chips as read-only badges (no secrets—these are public guardrail hints).
- Uses `suggestedEntities` to seed `ActiveContext.setSelectedEntity`. The flip-card connect button will therefore link the role-relevant record first.
- Exposes “Connect this view to Navi” to send the selection through `onQuickConnect` and highlight it on the back of the card.

## NaviPanel (back of FlipCard)
- Sorts the connection list by `navigationOrder`. For a sales manager, deals show before contacts; for revenue ops, hygiene tasks bubble to the top.
- Reuses `priorityHints` as chips so the operator sees role-specific nudges.
- Clicking a connection updates `ActiveContext` and pings `useConnections.markFromNavi`, keeping both faces in sync.

## Do / don’t
- **Do** treat the mapping as presentation only—no additional permissions are granted on the client.
- **Do** keep strings in sync with backend policy language (names align with `policyRoleAware`).
- **Don’t** log role information to the console beyond telemetry already defined.
- **Don’t** invent new backend calls for roles; the UI piggybacks on the existing context headers.
