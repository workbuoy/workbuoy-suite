# PR 2 – CXM: HubSpot read-only connector + health dashboard + dry-run writebacks

This patch implements:
- `lib/connectors/hubspot.js` with OAuth2 login helpers, read-only fetch for contacts/deals, health check, and dry-run `previewNote`.
- Replaces `pages/api/cxm/crm.js` mock with real HubSpot calls (falls back to fixtures in `NODE_ENV=test` or when `WB_CONNECTOR_ENABLE_FIXTURES=1`).
- Adds `pages/api/cxm/crm/notes.preview.js` and a rewrite in `next.config.js` to serve `POST /api/cxm/crm/notes:preview`.
- Extends integration health schema via `db/migrations/0012_integration_health.sql` with error counters and latency.
- Updates `/api/integration/health` to include HubSpot.
- Exposes Prometheus metric `wb_connector_errors_total{connector="hubspot"}` via `/api/metrics` using `lib/metrics.js`.
- Adds Jest unit tests and Playwright E2E covering the preview flow.
- Includes test fixtures.

## Setup

1. **Env vars (OAuth2)**

   ```bash
   export HUBSPOT_CLIENT_ID=...
   export HUBSPOT_CLIENT_SECRET=...
   export HUBSPOT_REDIRECT_URI=https://your.app/api/oauth/hubspot/callback
   export HUBSPOT_SCOPES="crm.objects.contacts.read,crm.objects.deals.read,oauth"
   ```

   For local development you can skip OAuth by using a **private app token**:

   ```bash
   export HUBSPOT_PRIVATE_APP_TOKEN=pat-xxx
   ```

2. **Install deps** (if not present in your repo):

   ```bash
   npm i -D jest @playwright/test nock
   npm i node-fetch@2
   npx playwright install
   ```

3. **Database migration**

   Apply `db/migrations/0012_integration_health.sql` to your Postgres instance.

4. **Run**

   ```bash
   npm run dev
   # GET contacts
   curl 'http://localhost:3000/api/cxm/crm?type=contacts&limit=3'
   # GET deals
   curl 'http://localhost:3000/api/cxm/crm?type=deals&limit=3'
   # POST dry-run preview
   curl -XPOST 'http://localhost:3000/api/cxm/crm/notes:preview' \
     -H 'content-type: application/json' \
     --data '{"objectType":"contact","objectId":"123","body":"Hello!"}'
   # Metrics
   curl 'http://localhost:3000/api/metrics'
   ```

5. **Tests**

   Unit tests (use fixtures automatically in `NODE_ENV=test`):

   ```bash
   NODE_ENV=test npx jest __tests__/hubspot.connector.test.js
   ```

   E2E test (starts your dev server separately):

   ```bash
   PW_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/notes-preview.spec.ts
   ```

## Notes

- **Read-only:** No write calls are made to HubSpot. The preview route assembles a diff describing what *would* be written.
- **Approval flow:** If a `tsunami/approve.js` module is present and exports `prepare({ connector, action, payload, preview })` it will be used. Otherwise the response still indicates approval is required.
- **Fixtures:** In `NODE_ENV=test` or when `WB_CONNECTOR_ENABLE_FIXTURES=1`, network calls are prevented and fixtures are returned.
- **Metrics:** `lib/metrics.js` keeps in-memory counters suitable for Prometheus scraping via `/api/metrics`. In long-lived environments you may want a more persistent metrics backend.
- **Health:** Each successful HubSpot call updates latency/last_success in `integration_health`. Errors increment counters and consecutive_errors. If your project already has a DB adapter, inject it into `HubSpotConnector({ db })`.
