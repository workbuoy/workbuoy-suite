# SOC2 / ISO27001 – Praktiske hooks (PR AN)

## Endringstyring
- PR-krav, godkjenning, CI-sikkerhetsskanning, versjonstagging.

## Tilgangsstyring
- Least privilege, kvartalsvis access review, break-glass kontoer logges.

## Sårbarhetsstyring
- Ukentlig skanning, 3/7/30-dagers SLA (kritisk/høy/moderat).

## Logging/Monitoring
- Audit for alle CRUD/DSR-operasjoner.
- OTEL/Prometheus + varsler (ref. connector/desktop dashboards).

## DR-kobling
- Se `docs/DR_RUNBOOK.md` – test DR minst kvartalsvis. Resultater i post-mortem.

## Privacy by Design
- Data-minimering, pseudo-/kryptering i hvile og transport.
