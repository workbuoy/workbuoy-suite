# CI/CD Rails (public-only npm path)

We only keep 3 workflows:
- backend-ci
- auto-merge
- smoke-open-pr

## Branch protection
- Require status checks: backend-ci
- Require 1 approval
- Require linear history: on

## Workflow permissions
Settings → Actions → General → Workflow permissions → **Read and write**

## Troubleshooting
- 403 on npm install? Make sure .npmrc is public-only:
  registry=https://registry.npmjs.org/
  fund=false
  audit=false
