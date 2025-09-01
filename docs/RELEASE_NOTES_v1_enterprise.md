# WorkBuoy Suite v1 (Enterprise) – Release Notes

**Dato:** 2025-08-27  
**Omfang:** CRM API + SDK, Desktop-klient (offline/sync), Connectors (Salesforce/Dynamics), Observability, Compliance/DR, Auto-update, Signering, Telemetry.

## Høydepunkter
- **Desktop**
  - E2E-kryptering av offline cache (AES‑GCM, Keychain/DPAPI/ENV) – *PR AE*
  - Signering & notarisering (macOS/Windows/Linux) – *PR AF*
  - Auto-update (stable/beta) + rollout/killswitch – *PR AG* + *PR AV*
  - E2E-tester (konfliktløsing + last) – *PR AH*
  - Telemetry (OTEL → Prometheus/Grafana) – *PR AW*
- **CRM & Connectors**
  - Salesforce (OAuth2 refresh, idempotent upsert, DLQ & metrics) – *PR AI*
  - Dynamics (OAuth2 CC, alternate key upsert, retry/backoff, DLQ & metrics) – *PR AJ*
  - Connector observability dashboards – *PR AK*
  - RBAC tester for CRM – *PR AL*
- **SaaS/Enterprise**
  - Multi-region/DR overlays, playbooks – *PR AM*
  - Compliance hooks (GDPR API & docs) – *PR AN*
  - Adaptive throttling (token bucket + backoff) – *PR AO*
- **Release & Supply chain**
  - SDK publisering (NPM/PyPI) – *PR AP*
  - Quickstart – *PR AQ*
  - GA orchestration – *PR AR*
  - Provenans/SBOM-hygiene – *PR AS*
  - Green-path E2E – *PR AT*
  - Alert hygiene & prod tuning – *PR AU*

## Endringer siden forrige minor
- Stabilitetsforbedringer i sync, bedre feilhåndtering (retry/backoff).
- Dashboards for connector health + desktop stability.
- Rollout-kontroller for oppdateringer (prosent, OS-targeting, hold/revoke).

## Kjente begrensninger
- SQLCipher direkte i DB-driver er planlagt i neste minor (cache er filkryptert per nå).
- Compliance (AN) på mock-nivå; prod-utdyping av kryptert eksport & DSR-automatisering kommer i patch.

## Oppgraderingsnotater
- CI-secrets må være satt for signering/notarisering.
- Sett `WB_SECRETS_KEY` / Keychain/DPAPI for desktop-cache.
- Konfigurer Prometheus/Grafana datasources og importer dashboards.
