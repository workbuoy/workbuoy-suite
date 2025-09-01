# WorkBuoy – Disaster Recovery Runbook (PR AM)

**Mål**
- **RTO**: ≤ 15 minutter
- **RPO**: ≤ 5 minutter (database replikering / log shipping)

## Forutsetninger
- Multi-region deploy: `active` og `passive`
- Redis/DB replikering etablert (utenfor scope i denne PR, pek mot managed tjenester)
- Observability: dr_overview-dashboard i Grafana

## Helsesjekk (pre-cutover)
1. Bekreft at passive region har grønne pods (`kubectl -n wb-passive get pods`)
2. Verifiser at databasen er i sync (lag-replikering < 5 min)
3. Pause bakgrunnsjobber i aktiv region (opsjon)

## Planlagt cutover (øvelse)
1. Skaler aktiv region til 0:
   ```bash
   kubectl scale deploy/workbuoy -n wb-active --replicas=0
   ```
2. Promoter passiv region til primær:
   ```bash
   helm upgrade --install workbuoy ops/helm/workbuoy -n wb-passive -f ops/helm/overlays/passive/values.yaml --set replicaCount=2 --set region.primary=true
   ```
3. Bekreft readiness:
   ```bash
   kubectl rollout status deploy/workbuoy -n wb-passive --timeout=2m
   ```
4. Oppdater trafikk (prod-lb/dns) – utføres av plattformteamet; i dette repoet simuleres dette i CI.

## Uforutsett nedetid (reell DR)
1. **Erkjenn** hendelsen, start incident.
2. **Stans** aktiv region (for å unngå split-brain).
3. **Promoter** passiv region (som over).
4. **Kommunikasjon**: statusmelding til kunder og interne kanaler.
5. **Post-incident**: root cause, tiltak, dokumentasjon.

## Verifikasjon
- App-helse ok i passiv.
- Skriveoperasjoner bekreftet (dummy eller røyk-test).
- Grafana viser normalisert feilrate og latency.

## Rollback
- Når aktiv region er frisk, flytt trafikk tilbake (planlagt), og sett `region.primary=true` på aktiv overlay.
