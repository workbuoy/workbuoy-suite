# Security Testing

## SAST
- CodeQL or Semgrep run on every PR.

## DAST
- OWASP ZAP Baseline scan against dev URL.

## Dependencies
- `npm audit` with allowlist (PR-required).

## Reporting
- All high findings must fail CI; allowlist changes require PR review and approval from Security.

## Scope
- API endpoints, auth flows, secrets handling, DB migrations.
