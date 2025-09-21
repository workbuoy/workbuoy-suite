# Kartvisninger

## Web CRM-kart
- `ContactMap` bruker Mapbox GL JS via `useMapbox`-hook.
- Sett `MAPBOX_TOKEN` (og eventuelt `MAPBOX_STYLE_URL`) i miljøet.
- Aktiver kartet fra CRM-panelet ved å velge **Vis kart** – kontakter med `lat`/`lng` markeres.

## Desktop-kart
- `desktop/src/map/staticMap.ts` bruker Mapbox Static API for å generere forhåndsvisning.
- Kall `renderMapView({ points })` i Electron-renderer eller generer HTML for eget vindu.
- `findNearby` i `desktop/src/geo/nearby.ts` hjelper med å finne nærmeste kontakter.

## Territorier
- Backend støtter `POST /api/v1/geo/territory/assign` for å slå opp territorier basert på GeoJSON.
