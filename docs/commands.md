# Conversational Commands & Morphing Input (PR-10)

**Mål:** Én input som forstår naturlige kommandoer og morfer til passende kontroll – kontakt-velger, kalkulator, (senere dato-plukker).

## Støttede mønstre (parser-stub)
- `show me tasks from last week` → `{ kind:"tasks.list", range:"last_week" }`
- `show tasks this week` → `{ kind:"tasks.list", range:"this_week" }`
- `show tasks today` → `{ kind:"tasks.list", range:"today" }`
- `find contact Ola` → `{ kind:"contacts.find", name:"Ola" }`
- `search emails invoice` → `{ kind:"emails.search", query:"invoice" }`
- `show invoices overdue last month` → `{ kind:"invoices.list", status:"overdue", range:"last_month" }`
- `search <query>` → `{ kind:"search", query }`
- ellers → `{ kind:"unknown", text }`

## Morphing atferd
- **@navn** → foreslår kontakter (fra `/api/crm/contacts`).
- **=…** eller rene regneuttrykk → kalkulerer og viser resultat inline.
- **Dato/klokkeslett-hint** → detekteres nå, kalender-UI kommer i senere PR.

## Integrasjon
- `MorphInput` erstatter vanlig `<input>` i `BuoyChat` og kaller `onSubmit(text, intent)`.
- `useBuoy.send(text, intent)` gir en kort bekreftelse i stub-svaret når en intent gjenkjennes.

> Ingen backend-endringer. Dette er 100% frontend-stub som Dev senere kan koble til `/core/complete`.