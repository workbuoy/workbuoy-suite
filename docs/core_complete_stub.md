# /core/complete stub (PR-28)

- `POST /core/complete { text, intent? }`
- Leser `req.wb` for `intent/when/autonomy`.
- Returnerer `200` med `text` + `explanations[]`, eller `403` med `explanations[]` hvis autonomy < 1 og intensjonen er skrivende.