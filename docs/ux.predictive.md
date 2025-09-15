# Predictive Loading & Smart Skeletons (PR-11)

**Mål:** Opplev raskere og mer kontekstsensitiv UI ved å forvarme data du sannsynligvis trenger.

## Prinsipp
- **Heuristikk først (UI):** Ukedag + siste intents styrer hva vi prefetche'r.
- **Alltid reversibelt:** Backend er kilden til sannhet; dette er kun presentasjon.
- **Forklarbarhet:** Skeleton-tekst forteller *hva* vi gjør (“Laster mandagsrapporter…”).

## API (UI)
```ts
const { status, heat, schedule, message } = usePredictivePrefetch({ intents?: string[] });
```
- `status`: `idle` | `prefetching` | `ready`
- `heat`: `cold` | `warm` | `hot`
- `schedule`: hva som faktisk ble forsøkt prefetchet
- `message`: menneskelig lesbar status (mandag/uke/sluttuke)

## Integrasjon
- `NaviGrid` viser `SmartSkeleton` mens addons/CRM forvarmes.
- `BuoyChat` viser skeleton ved første last hvis vi fortsatt prefetcher.

## TODO (Dev)
- Eksponere siste intents fra CORE (valgfritt).
- Tillate server-sidet “hints” (eks. `X-WB-Prefetch-Hints`).
- Telemetri på treffrate (hvor ofte brukeren faktisk åpner det vi varmet).