# WorkBuoy Connectors (New)

| Connector     | API Type      | Scope (examples)                         | Use-cases                                    |
|---------------|---------------|------------------------------------------|----------------------------------------------|
| Infor M3      | Infor ION REST/OData | Orders, inventory, delivery plans     | Order status, ATP/available inventory feed   |
| NetSuite      | REST          | Invoices, sales orders, customers        | Billing sync, order to cash pipeline         |
| Jira          | REST          | Issues, projects, statuses               | IT/project metrics, incident visibility      |
| Zoom          | REST          | Meetings, webinars                       | Meeting analytics, attendance                |
| Google Drive  | REST          | Files, permissions                       | Document inventory, sharing risk             |
| BambooHR      | REST          | Employees, time off, roles               | HR directory, PTO calendar                   |
| Qlik Sense    | REST/QRS      | KPIs, dashboards, alerts                 | BI surfacing, alert stream                   |

## Implementation pattern
- `withIncrementalSync` (where supported) via `lib/connectors/index.js`
- Secrets retrieved with `getSecret(secretRef)`
- Metrics: `wb_connector_sync_total`, `wb_connector_err_total`, p95 via histogram
- Audit events on start/success/failure
- Exposed under `/api/connectors` (list + POST trigger)
- Admin toggles at `/portal/connectors`

> Note: Replace placeholder endpoints with production endpoints per tenant/config.


## Round 2 Connectors

| Connector           | API Type                | Auth        | Rate limits (indicative)            | Scope                                   | Enterprise Use-cases                               |
|---------------------|-------------------------|-------------|-------------------------------------|-----------------------------------------|----------------------------------------------------|
| SharePoint (Graph)  | REST (Microsoft Graph)  | OAuth2      | ~10k req/10min per app (tenant)     | Documents, lists, sites                 | Doc inventory, permissions review, sharing risk    |
| Workday             | SOAP + REST             | OAuth2/SAML | Varies by tenant                    | Workers, Orgs                           | HR source-of-truth, org insights                   |
| ServiceNow          | REST                    | Basic/OAuth | Instance-level                      | Incidents, Requests                     | ITSM metrics, SLA/SLO tracing                      |
| Oracle Fusion ERP   | REST                    | Basic/OAuth | Instance-level                      | Finance, HR objects                     | Finance rollups, reconciliations                   |
| Adobe Analytics/AEM | REST                    | OAuth2      | Adobe org limits                    | Reports, Content                         | Digital analytics KPIs, content catalogs           |
| IFS ERP             | OData (REST)            | OAuth2      | Instance-level                      | Manufacturing, Supply chain              | Work orders, order-to-ship tracking                |


## Dev Ready – connectors status
- **Workday**: real (RaaS/REST skeleton, incremental cursor)
- **SharePoint**: real + delta hardening (cursor persist)
- **Jira/BambooHR**: real
- **NetSuite/Qlik**: stubs (klar for real)


### Real connectors (oppdatert)
- **NetSuite**: SuiteQL via REST (TBA-signering), incremental på `lastModifiedDate`, paginering.
- **Infor M3 (ION/OData)**: OAuth2 client-credentials, filter `ChangedDateTime ge :since`.
- **Qlik Sense (QRS)**: XRF-key/CSRF, API Key/cert-støtte (konfig), listing av apps/streams.
- **Workday**: RaaS/REST workers – incremental cursor.
- **SharePoint**: Delta-sync (`@odata.deltaLink`) med cursorpersist.

Se `lib/connectors/*.real.js` for detaljer og ENV-variabler.
