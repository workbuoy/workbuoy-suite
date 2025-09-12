
# feat(ux): Navi manifest + intent stub (PR-4)

**Hva**
- `docs/addons/manifest.md` (MVP-schema og regler).
- Frontend mock: `GET /api/addons` og `POST /api/addons/intent`.
- `NaviGrid` bruker `types.ts`, logger intent, håndterer connectUrl.

**Hvorfor**
- Ren kobling mellom visualisering (Navi) og handling (intent). Forenkler backend-integrasjon senere.

**Hvordan teste**
- `cd frontend && npm run dev`
- Flip til Navi. Klikk på tile:
  - `enabled=false` → åpner `connectUrl` i ny fane.
  - Ellers → intensjon logges (se devtools console).

**Risiko/rollback**
- Kun frontend + docs. Trygt å reverte.

**TODO (@dev)**
- Ekte `/api/addons` i backend + persistering av intent.
- Ikon-URL-støtte (ikke bare emoji).
