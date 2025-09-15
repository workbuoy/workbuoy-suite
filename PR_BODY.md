
# feat(ux): Predictive Loading + Smart Skeletons (PR-11)

**Hva**
- `usePredictivePrefetch` (ukedag + siste intents) for å forvarme sannsynlige kall.
- `SmartSkeleton` for kontekstsensitiv lastemelding.
- Integrasjon i `NaviGrid` og `BuoyChat` via små patcher.
- Dokumentasjon i `docs/ux.predictive.md`.

**Hvorfor**
- Opplevelsen føles “klar før du spør” – spesielt på mandag/ukeavslutning.

**Hvordan teste**
- `cd frontend && npm run dev`
- Åpne appen → se skeleton med “Laster mandagsrapporter…” (mandag) eller generell melding.
- Flip til Navi → skeleton vises før tiles, forsvinner når prefetch er “ready”.

**Risiko/rollback**
- Kun frontend + docs. Ingen backend/CI-endringer.
- Prefetch er best effort; avbrytes når komponent unmountes.

**TODO (@dev)**
- Valgfritt: gi `recentIntents`/prefetch-hints fra backend.
