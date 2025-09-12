
# Add-on manifest (MVP)

**Mål:** Backend eksponerer et enkelt endepunkt `/api/addons` som returnerer en liste med add-ons. Frontend (Navi) henter og viser disse som elegante tiles. Klikk på tile logger en intent via `/api/addons/intent` (MVP).

## JSON schema (uformell v1)

```json
{
  "id": "string",
  "name": "string",
  "icon": "string (emoji el. URL, optional)",
  "category": "string (optional)",
  "enabled": "boolean",
  "description": "string (optional)",
  "connectUrl": "string (optional, brukes når enabled = false)"
}
```

### Regler
- `id` er unik nøkkel.
- `enabled=false` → tile vises dempet og klikk åpner `connectUrl` i ny fane (OAuth/innlogging).
- `enabled=true` → klikk logger intent og (senere) navigerer til add-on view/panel.
- `category` grupperer tiles i filter i UI.
- `icon` kan være emoji (MVP) eller URL til ikon (senere).

## Endepunkt (MVP)
- `GET /api/addons` → `AddOn[]`
- `POST /api/addons/intent` body: `{ "id": string, "intent": "open", "at": ISODate }`

## A11y
- Tile-knapper har `aria-label` og tydelige fokusringer.
- Kontrastkrav oppfylles (tekst og kantlinjer).
