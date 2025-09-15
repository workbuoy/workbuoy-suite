
# Active Context (PR-13)

**Mål:** Lettvekts situasjonsbilde for UI: `timeOfDay`, `selectedEntity`, `recentIntents`.

## API
```ts
type SelectedEntity = { type: "contact"|"deal"|"invoice"|"task"; id: string; name?: string };
const { timeOfDay, selectedEntity, recentIntents, setSelectedEntity, pushIntent } = useActiveContext();
```

## Integrasjon
- `FlipCard` wrapper appen med `ActiveContextProvider` og viser en Context-debug (kan skjules).
- `NaviGrid` → `pushIntent("<tile>.open")` ved åpning av add-on.
- `ContactsPanel` → `pushIntent("contacts.view")` ved mount; klikker en rad setter `selectedEntity`.
- `useBuoy.send` → pusher `chat.<intent>` når intent gjenkjennes.

> Kun frontend. Backend/policy kan senere konsumere headere for kontekst.
