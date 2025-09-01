# WorkBuoy Suite 1.0 (GA)

## Høydepunkter
- Full CRM + Desktop med enterprise-kontroller (RBAC, audit, SSO/SCIM-forutsetninger).
- Connectors til Salesforce og Dynamics med idempotent upsert, DLQ og varsling.
- DR-oppsett (aktiv–passiv) og cutover-simulering i CI.
- GDPR-støtte (mock-APIer for dataport, sletting, portabilitet) + webhooks.
- Adaptiv throttling i SDK/Workers, publiserte SDK-er (NPM/PyPI).

## Kjente avvik
- Connector-latens p95 grafer er placeholder inntil histogrammet eksponeres.
- Desktop signering/notarisering for macOS/Windows avhenger av eksterne sertifikater/secrets.

## Oppgradering
1. Oppgrader Helm chart og kjør migrasjoner (om noen).
2. Rull ut connectors med korrekt secrets (Salesforce, Dynamics).
3. Verifiser dashboards/alerts, kjør `dr-cutover-sim` som øvelse.
4. Publiser SDK-tags for klientbiblioteker ved behov.

## Viktige lenker
- Quickstart: `docs/CRM_DESKTOP_QUICKSTART.md`
- DR-runbook: `docs/DR_RUNBOOK.md`
- SDK-publisering: `docs/SDK_PUBLISHING.md`
