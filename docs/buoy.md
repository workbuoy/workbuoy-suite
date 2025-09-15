# Buoy interaksjonskontrakt (UI)

## Meldingsschema
- **UserMessage**: `{ id, role:"user", text }`
- **AssistantMessage**: `{ id, role:"assistant", text, why[], viz, actions[] }`
- **VisualizationAttachment**: mini-grafer (sparkline, bar, donut)
- **ActionSuggestion**: forslag som knapper

## Forklarbarhet
Alle assistentmeldinger kan inneholde `why[]`. Vises via **WhyDrawer**.

## Gradert autonomi (konsept)
Passiv → Proaktiv → Ambisiøs → Kraken (policy-styrt).

## Neste steg (for Dev)
- Ekte AI-respons koblet til CORE (/buoy/complete).
- Logging av provenance.
- Persistens av meldinger.