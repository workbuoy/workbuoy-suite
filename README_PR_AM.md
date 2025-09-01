# PR AM: Multi-region / DR (Helm overlays + cutover-sim + runbook)

## Endringsplan
- **Helm chart**: `ops/helm/workbuoy` – minimal app som lar oss simulere helsetilstand
- **Overlays**: `ops/helm/overlays/{active,passive}/values.yaml`
- **CI**: `.github/workflows/dr-cutover-sim.yml` – kind + helm, kjører `scripts/dr_cutover.sh`, genererer `reports/dr_cutover.json`
- **Dashboard**: `ops/dashboards/dr_overview.json`
- **Runbook**: `docs/DR_RUNBOOK.md`

## Kjør lokalt (minikube/kind)
```bash
kubectl create ns wb-active wb-passive
helm upgrade --install workbuoy ops/helm/workbuoy -n wb-active -f ops/helm/overlays/active/values.yaml
helm upgrade --install workbuoy ops/helm/workbuoy -n wb-passive -f ops/helm/overlays/passive/values.yaml
# Cutover
kubectl scale deploy/workbuoy -n wb-active --replicas=0
helm upgrade --install workbuoy ops/helm/workbuoy -n wb-passive -f ops/helm/overlays/passive/values.yaml --set replicaCount=2 --set region.primary=true
```

## Artefakter
- `reports/dr_cutover.json` – genereres i CI under cutover-sim.

## Rollback
- Skaler opp aktiv region og sett `region.primary=true` i `overlays/active/values.yaml`, kjør `helm upgrade`.
