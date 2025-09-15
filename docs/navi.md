# Navi-moduser (gradert autonomi)

**Mål:** Brukeren kontrollerer hvor aktiv Buoy skal være. UI-en speiler nivået, mens backend-policy bestemmer hva som faktisk er lov.

## Moduser
- **Passiv:** Vis forslag. Ingen handlinger.
- **Proaktiv:** Vis forslag + handlinger (ett klikk).
- **Ambisiøs:** Forbered utkast automatisk.
- **Kraken:** Kan auto-utføre (policy-styrt).

## UI-policy (kun presentasjon)
| Modus     | Forslag | Handlinger | Auto-utkast | Auto-utfør |
|-----------|---------|------------|-------------|------------|
| Passiv    | ✓       | –          | –           | –          |
| Proaktiv  | ✓       | ✓          | –           | –          |
| Ambisiøs  | ✓       | ✓          | ✓           | –          |
| Kraken    | ✓       | ✓          | ✓           | ✓          |

> Backend (policy-motor) er kilden til sannhet. UI-policy er kun hints for presentasjon.

## Komponenter
- `AutonomyProvider` — kontekst som holder gjeldende modus.
- `ModeSwitch` — bryter/knapperad som endrer modus.
- `POLICY` — mapping fra modus → hva UI kan vise.

## Integrasjon
- `FlipCard` wrapper hele kortet med `AutonomyProvider` og viser `ModeSwitch` i headeren.
- `BuoyChat` viser gjeldende modus og skjuler/viser action-knapper basert på policy.