# Undo That Thinks Ahead (PR-16)

**Mål:** Foreslå “angre” proaktivt, ikke bare etter sist handling — men på det brukeren *mest sannsynlig* ikke mente.

## Design
- `SmartUndoProvider` holder en liten liste `suggestions[]` (maks 5).
- `addAction(action)` mates fra UI-hendelser (f.eks. opprett/slett kontakt).
- Heuristikk (UI-stub): raske etterfølgende klikk, risikable handlinger (slett), “kan reverseres uten tap” → gir en `UndoSuggestion`.
- `UndoChips` rendrer chips under Buoy-feed; klikk viser `WhyDrawer` med forklaring.

## Eksempler i denne PR-en
- **Opprett kontakt** → “Angre opprettelse av <navn>”
- **Slett kontakt** → “Angre sletting av <navn>”

> Dette er **kun frontend-stub**. Backend kan senere levere ekte `undoToken` som kan sendes til `/core/undo` for garantert reversering (og logging).

## Videre arbeid
- Risiko-score (høy → vis tydeligere; lav → mindre pågående).
- Tidsvindu (forslag utløper etter X minutter).
- Integrasjon med Policy (noen brukere får auto-undo ved å trykke `Esc`).