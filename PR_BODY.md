
# feat(ux): Active Context (timeOfDay, selectedEntity, recentIntents) – PR-13

**Hva**
- `ActiveContextProvider` + `useActiveContext()`.
- `ContextDebug`-widget.
- Patcher for `FlipCard`, `NaviGrid`, `ContactsPanel`, `useBuoy`.
- `docs/context.md`.

**Hvorfor**
- Felles kontekst som Buoy og Navi kan bruke for smartere forslag og forklarbarhet.

**Hvordan teste**
- `npm run dev` i `frontend`
- Åpne Context-debug nederst til høyre → se verdier endres når du navigerer og klikker.

**Risiko/rollback**
- Kun frontend + docs. Små patcher, enkel revert.

**TODO (@dev)**
- Evt. eksponere kontekst til backend via headere.
