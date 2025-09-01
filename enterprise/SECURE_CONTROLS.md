# Controls Mapping — SOC 2 / ISO 27001

| Control | Implementation | Evidence | Owner | Review |
|---|---|---|---|---|
| Access Control | RBAC/SSO (OIDC), least privilege | screenshots, config, audit logs | Eng Lead | Quarterly |
| Change Mgmt | PR policy, WORM audit on prod changes | PRs, audit logs | Eng Lead | Monthly |
| Incident Mgmt | RUNBOOK.md, Pager integration | Post-mortems, alerts | SRE | Quarterly |
| Vendor Mgmt | SUBPROCESSORS.md, DPAs | Vendor DPAs | Legal | Annual |
| Logging/SIEM | lib/secure/siem.js, /api/metrics | SIEM exports | SRE | Monthly |
| Backup/Restore | scripts/bcdr/* | RESTORE_LOG.md | SRE | Monthly |
| DR | BCDR.md | DR test report | SRE | Annual |
| Key Mgmt | lib/crypto/*, rotation scripts | Rotation logs | Security | Quarterly |
| Vulnerability Mgmt | CI scans (SAST/DAST/Deps) | CI reports | Security | Continuous |
