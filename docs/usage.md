# Usage Signals

Feature usage telemetry is persisted in Postgres when `FF_PERSISTENCE=true` and falls back to an in-memory buffer for local smoke testing.

## Event Shape

```json
{
  "userId": "u-123",
  "tenantId": "ACME",
  "featureId": "cashflow_forecast",
  "action": "open" | "complete" | "dismiss",
  "ts": "2024-06-01T12:34:56.000Z"
}
```

`POST /api/usage/feature` records events. When persistence is enabled the handler writes to Prisma's `FeatureUsage` table (enum `FeatureUsageAction`).

## Aggregation

`GET /api/usage/aggregate/:userId`

- Optional `x-tenant` header filters counts per tenant.
- Response is a `{ featureId: count }` map.

The Active Features API consumes this aggregation to boost frequently used features:

```
score = autonomyCap + log(usage + 1) * 1.2 + industryBoost
```

## Admin & Debugging

- Clear usage during tests with `DELETE FROM "FeatureUsage";`
- The shared router and stores live in `packages/backend-telemetry`.
- Legacy shims remain in `src/telemetry/*` and are marked `@deprecated`.
