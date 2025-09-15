
# Backend TODOs — wire-up for UX PRs (PR-17, PR-25, PR-26)

**Labels:** `backend`, `api`, `policy`, `why`, `automerge`  
**Milestone:** Core α

## 🎯 Scope
Koble eksisterende UI til backend med forklarbarhet (WhyDrawer) og audit. Alt skal fungere trygt i dev (no secrets).

## ✳️ Endepunkter
- [ ] `GET /api/addons` — returner manifest `{ id, name, icon, category, enabled }[]`
- [ ] `GET /api/crm/contacts` — liste (kan være in-memory først)
- [ ] `POST /api/crm/contacts` — opprett, returner `201 {..}`
- [ ] `DELETE /api/crm/contacts/:id` — `204`
- [ ] `POST /core/complete` — tekst + (valgfritt) `intent` → stub-respons `{ text, explanations? }`
- [ ] `POST /core/undo` — `token` → stub `200 { ok:true }`

## 🧭 Headere (fra UI via PR-17)
- `X-WB-Intent: contacts.create | contacts.delete | addons.list | undo.perform | ...`
- `X-WB-When: 2025-10-12T14:00` (fra MorphInput `:: when=` enrich)
- `X-WB-Autonomy: 0..5` (valgfritt, for policy v2)
- `X-WB-Selected-Id`, `X-WB-Selected-Type` (aktiv kontekst)

➡️ **Gjør:** Les disse i middleware, legg på `req.wb.*` og inkluder i audit.

## 🧰 Policy & 403 forklaringer
- [ ] Policy-guard på *write*-ruter (POST/DELETE) som kan returnere `403`
- [ ] `403` payload **må** inkludere `explanations: string[] | {title,quote,link,source}[]`
- [ ] Eksempel:
  ```json
  {
    "error": "forbidden",
    "explanations": [
      {"title":"Autonomi", "quote":"Nivå 0 tillater ikke automatisk opprettelse", "source":"Policy"},
      {"quote":"Prøv å øke autonomi i Navi eller be en kollega godkjenne"}
    ]
  }
  ```

## 🧾 Audit
- [ ] `POST /api/audit` logger: timestamp, userId (stub), `X-WB-*`, route, status, explanations (ved 4xx/5xx)

## 🔎 Eksempler (curl)
```bash
curl -i -X POST http://localhost:3000/api/crm/contacts   -H "Content-Type: application/json"   -H "X-WB-Intent: contacts.create"   -H "X-WB-When: 2025-10-12T14:00"   -d '{"name":"Ada Lovelace","email":"ada@example.com"}'
```

```bash
curl -i -X POST http://localhost:3000/core/complete   -H "Content-Type: application/json"   -H "X-WB-Intent: chat.summarize"   -d '{"text":"Lag utkast til e-post"}'
```

## ✅ Akseptanse
- [ ] UI med `Flags.realBackend=true` kjører end-to-end mot stubber
- [ ] 403 på write-rute viser WhyDrawer med rike forklaringer
- [ ] Audit-endepunkt fanger `X-WB-*` og responsstatus
