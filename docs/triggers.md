# Triggers & Suggestions (PR-14)

**Mål:** La UI foreslå handlinger proaktivt, basert på kontekst og enkle regler.

## TriggerEngine
En lettvekts hook (`useTriggerEngine`) overvåker `ActiveContext` og legger til forslag via `addSuggestion`.

Eksempelregel i denne PR-en:
- Hvis valgt entitet er `contact` og siste intents inkluderer `invoice` eller `crm`
- → Legg til forslag: “Send purring”
- → Forklaring (`WhyDrawer`): “Kilde: CRM (utestående faktura NOK 5000)”, “Mønster: ingen aktivitet på 14 dager”.

## BuoyChat-integrasjon
- Forslag rendres som **chips** under meldingsloggen.
- Klikk på en chip åpner **WhyDrawer** med forklaringer.

## TODO (Dev)
- Bytte ut heuristikker med backend-drevne events/triggers.
- Logge aksept/avslag på forslag for læring/justering.