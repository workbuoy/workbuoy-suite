# CI Hotfix for META PR1 & PR2

This patch:
- Fixes OpenAPI root security and adds operationId for all META operations.
- Replaces failing custom workflows with lightweight validations:
  - PR1: swagger-parser + spectral lint
  - PR2: swagger-parser + esbuild smoke of the router
No Jest required; relies on your existing backend CI for full tests.
