# CRM Geo APIs

Arbeid med geografiske data for Workbuoy CRM benytter Mapbox til geokoding og territorieoppslag.

## Geokoding (`POST /api/v1/geo/geocode`)
- Body: `{ "addresses": ["Storgata 1, Oslo", "Bergen"] }`
- Respons: `{ "results": [{"lat": 59.91, "lng": 10.75, "precision": "address", "label": "Storgata 1, Oslo"}, ...] }`
- Krever `MAPBOX_TOKEN` i miljøet. Resultatene caches i Redis (`GEO_CACHE_TTL`, default 24t).

## Territorieoppslag (`POST /api/v1/geo/territory/assign`)
- Body: `{ "point": {"lat": 59.91, "lng": 10.75}, "territories": [{"id": "oslo", "polygon": { ...GeoJSON... }}] }`
- Respons: `{ "territory": { "id": "oslo", "properties": { ... } } }` eller `{ "territory": null }` dersom ingen treff.
- Støtter både `polygon`, `shape` og `geometry` felt på territorier for enkel import fra GeoJSON.

## CLI / Testing
```
curl -X POST http://localhost:3000/api/v1/geo/geocode \
  -H "Content-Type: application/json" \
  -d '{"addresses":["Dronning Eufemias gate 16, Oslo"]}' | jq
```
