# WorkBuoy Patch – Playwright & Coverage

This patch adds:
1) `playwright.config.ts` – enables E2E tests in CI
2) `package.json` – adds coverageThreshold and e2e scripts
3) `.github/workflows/ci-cd.yml` – runs Jest + Playwright in pipeline

## Apply
- Copy these files to the root of your WorkBuoy repo, overwriting existing ones if present.
- Ensure you have `docker/docker-compose.yml` and E2E tests under `__tests__/e2e`.
- In GitHub, set `DEPLOY_WEBHOOK_URL` secret if you use the deploy step.

## Run locally
npm install
npx playwright install --with-deps
npm run test
npm run test:e2e
