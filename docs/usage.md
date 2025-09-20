# Usage signals

Usage telemetry for features is persisted in Postgres when `FF_PERSISTENCE=true`. Each event in the `FeatureUsage` table captures the tenant, user, feature id, action (`open | complete | dismiss`) and timestamp. In-memory storage is retained for `FF_PERSISTENCE=false` to keep local dev lightweight.

## Recording events

POST `/api/usage/feature` accepts JSON:

```json
{
  "userId": "u-123",
  "featureId": "cashflow_forecast",
  "action": "open"
}
```

The handler normalises the payload, attaches the tenant from `x-tenant` and writes it to the database (or in-memory store when persistence is disabled).

## Aggregation

GET `/api/usage/aggregate/:userId` returns aggregate counts per feature for the requested user (scoped to the tenant header). Aggregation uses a Postgres `GROUP BY` when persistence is enabled. In-memory mode still returns the computed counts if any events were recorded during the process lifetime.

These aggregates feed the feature activation service so the `/api/features/active` endpoint can rank features by autonomy cap, usage intensity and tenant context.
