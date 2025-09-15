# feat(ux): Backend wiring from UI + feature flag (PR-25)

**Hva**
- `Flags.realBackend` for trygg aktivering av ekte serverkall.
- `useEndpoints()` med typed klientkall for CRM/Buoy/Undo.
- Oppdaterte paneler (ContactsPanel, NaviGrid) til å bruke `useEndpoints`.
- `useBuoy` kan kalle `/core/complete` når flagget er på.
- `docs/integration-plan.md` beskriver endepunkter + TODO for dev.

**Hvorfor**
- Rask overgang fra demo til ekte handlinger, uten å endre UX.

**Hvordan teste**
- Default (`realBackend=false`) → alt som før (stub).
- Sett `realBackend=true` → UI bruker ekte API-er.
- Verifiser at 403 fra `createContact/deleteContact` fortsatt åpner WhyDrawer.

**Risiko/rollback**
- Kun frontend + docs. Flip av feature flag styrer adferd.