# Data Protection Impact Assessment (DPIA)

## Overview
- **Processing:** WorkBuoy platform operations
- **Lawful basis:** Contract
- **Systems:** API, DB (Postgres), Storage (S3/GCS), Observability

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation | Residual |
|---|---:|---:|---|---|
| Unauthorized access to PII | Medium | High | KMS envelope, RBAC/SSO, least privilege | Low |
| Data loss | Low | High | Backups + monthly restore test | Low |
| Transfer to 3rd countries | Medium | Medium | SCCs + TIA + encryption | Medium |

## Stakeholders
- DPO, Engineering, Security, Support

**DPO Sign-off:** _Name, Date_
