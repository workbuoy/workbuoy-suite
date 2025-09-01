# Alert Hygiene & Prod Tuning (PR AU)

Mål: Redusér varslestøy, sikre tydelig filtrering per miljø og koble varsler til SLO-er og tiltak.

## Omfang
- **Prometheus alerts** med `for:`-vinduer:
  - *No ingest*: 15 min uten upserts (Salesforce/Dynamics)
  - *High error rate*: >5% feil over 10 min
- **Alertmanager tidvindu**: kun aktive i **arbeidstid** (08:00–18:00 Europe/Oslo), lav-prioritet rute ellers
- **Grafana**: miljøvariabel (`$env`) og provider-filter, **DLQ trend**-stat

## Terskler (initiale)
- **No ingest**: 0 oppdateringer i 15m → *warning*
- **High error rate**: feil/(feil+ok) > 5% i 10m → *critical*

Juster etter trafikkvolum pr. miljø; vurder egne terskler for *staging* vs *prod*.

## Eskalering
1. Pager/email til *oncall* (arbeidstid). Utenfor arbeidstid → *lowprio* kanal (triageres neste dag).
2. Hvis `High error rate` varer > 30m → eskalér til team lead og åpne incident.

## Rotårsaksindikatorer
- DLQ vokser (positiv **Δ1h** i dashboard) samtidig som feilrate er høy → sannsynlig upstream issues eller api limits.
- *No ingest* + normal DLQ → sannsynlig scheduler/connector stoppet.
- *High error rate* + `429` i logger → aktiver/adjusér adaptive throttling.

## Operativt
- **Mute windows** (ved planlagt vedlikehold): legg tidsintervaller i Alertmanager eller bruk silences med tidsrom.
- **Verifisering**:
  - `promtool check rules ops/alerts/rules/*.yaml`
  - `amtool check-config alertmanager/config.yaml`

## Vedlegg
- Prometheus-regler: `ops/alerts/rules/*.yaml`
- Alertmanager-config: `alertmanager/config.yaml`
- Grafana-dashboard: `grafana/dashboards/ops_overview.json`
