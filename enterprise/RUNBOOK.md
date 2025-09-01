# WorkBuoy Runbook (Connectors Round 2)

## Secrets
- SHAREPOINT_SECRET: { token }
- WORKDAY_SECRET: { token|username,password, baseUrl, tenant }
- SERVICENOW_SECRET: { username, password|token, baseUrl }
- ORACLE_FUSION_SECRET: { username, password|token, baseUrl }
- ADOBE_EXPERIENCE_SECRET: { token, tenant }
- IFS_ERP_SECRET: { token, baseUrl }

## Incident checks
- Prometheus: p95 / failure rate / freshness panels
- /api/connectors/status for last since/count/errors
- SIEM: audit events hash-chained

## Retry/backoff
- Default retry handled by scheduler/connector; 5xx raises error -> metrics and alerts
