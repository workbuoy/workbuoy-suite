# API Overview
- CRM: `openapi/crm.yaml`
- Tasks: `openapi/tasks.yaml`
- Log: `openapi/log.yaml`
- Finance: `openapi/finance.yaml`
- Buoy: `openapi/buoy.yaml`
- Manual: `openapi/manual.yaml`
- Proactivity: `openapi/proactivity.yaml`

CI runs Spectral (non-blocking) over all specs.

## Examples

```bash
# Resolve proactivity state with compat mapping
curl -H "x-tenant: TENANT" -H "x-user: user" -H "x-role: sales_rep" \
     -H "x-proactivity-compat: 2" https://api.workbuoy.local/api/proactivity/state

# Approve a proposal (requires Kraken mode)
curl -X POST -H "x-tenant: TENANT" -H "x-user: approver" -H "x-role: manager" \
     -H "x-proactivity: kraken" -H "Idempotency-Key: proposal-123" \
     https://api.workbuoy.local/api/proposals/PROPOSAL_ID/approve
```
