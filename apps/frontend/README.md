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

## BuoyDock-widgeten

- Frontpanelet (Buoy) viser chatten og "Vis hvorfor"-konteksten, mens baksiden (Navi) inneholder handlingslisten og nav-ruter.
- Space/Enter åpner/lukker docken og flipper kortet; Escape kollapser docken og returnerer fokus til trigger-knappen.
- Når docken er utvidet holdes fokus inne i komponenten med Tab/Shift+Tab, og `aria-live` oppdaterer status når siden skifter.
- `prefers-reduced-motion` fanges opp via `matchMedia` slik at animasjoner tones ned for brukere som ber om redusert bevegelse.

## Demo routes

Tilgjengelige demovyer er tilgjengelige direkte i Vite-devserveren:

- `/demo` – viser `FlipCard` og `ProactivitySwitch` sammen. Bruk Tab for fokus, Enter/Space for å endre modus og flippe kortet. Live-statusen annonserer "Proactive mode enabled" / "Reactive mode enabled".
- `/dock-demo` – demonstrerer `BuoyDock` med Buoy-chatten på forsiden og Navi-backloggen på baksiden, komplett med fokusfelle, Escape for kollaps og redusert bevegelse når `prefers-reduced-motion` er aktiv.

## Dashboard route

- `/dashboard` – lett dashboard med proaktiv/reaktiv prioritering. Åpne `npm run dev` og naviger til `/dashboard`.
- ProactivitySwitch prioriterer tiles og annonserer status i aria-live-sonen.
- Tab flytter fokus mellom kontrollene i hver tile i rekkefølge, og Enter/Space kan brukes på knappene.
- Skjelettlasting indikeres via `aria-busy` på seksjonen frem til innholdet er klart.

Alle demoer er tilgjengelige uten ekstra avhengigheter og deler byggeoppsettet til hovedappen.

## QA a11y

Kjør den lettvekts axe-sjekken for `/dashboard` og `/dock-demo` med Vitest:

```bash
npm run qa:a11y -w @workbuoy/frontend
```

Kommandoen starter Vitest med jsdom-miljø og rapporterer eventuelle brudd i `$GITHUB_STEP_SUMMARY` når den kjøres i CI.
