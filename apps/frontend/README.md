# Workbuoy Frontend Shell

Dette prosjektet er et Vite/React-skall for WorkBuoy-opplevelsen. Mock av `/api/health` og `/api/addons` følger med slik at appen kan kjøres isolert.

## Kom i gang

```bash
npm install
npm run dev
```

- Space/Enter for å flippe hovedkortet (Buoy ↔ Navi) i standardskallet.
- Chat-panelet viser mikro-visualiseringer og "Vis hvorfor"-skuff.
- Navi viser add-ons som diskrete tiles basert på mock-data.

## Demo routes

Tilgjengelige demovyer er tilgjengelige direkte i Vite-devserveren:

- `/demo` – viser `FlipCard` og `ProactivitySwitch` sammen. Bruk Tab for fokus, Enter/Space for å endre modus og flippe kortet. Live-statusen annonserer "Proactive mode enabled" / "Reactive mode enabled".
- `/dock-demo` – demonstrerer DockHost-komponenten med fokusfelle og tastaturnavigasjon.

## Dashboard route

- `/dashboard` – lett dashboard med proaktiv/reaktiv prioritering. Åpne `npm run dev` og naviger til `/dashboard`.
- ProactivitySwitch prioriterer tiles og annonserer status i aria-live-sonen.
- Tab flytter fokus mellom kontrollene i hver tile i rekkefølge, og Enter/Space kan brukes på knappene.
- Skjelettlasting indikeres via `aria-busy` på seksjonen frem til innholdet er klart.

Alle demoer er tilgjengelige uten ekstra avhengigheter og deler byggeoppsettet til hovedappen.
