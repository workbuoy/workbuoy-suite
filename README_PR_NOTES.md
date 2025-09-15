# Roles + Runner + Active Features + Usage + Job-board (drop-in)

## Mount these routes in your Express server (backend/server.ts)
```ts
import featuresRoute from './routes/features';
import usageRoute from './routes/usage';
import jobboardsDev from './routes/jobboards.dev';
import devRunner from './routes/dev.runner';

app.use(featuresRoute);
app.use(usageRoute);
app.use(devRunner);            // dev only if you prefer
if (process.env.NODE_ENV!=='production') app.use(jobboardsDev);
```

## Endpoints
- GET /api/features/active
- POST /api/usage/feature
- GET /api/usage/aggregate/:userId
- POST /dev/run   (body: { capability, featureId?, payload? }, headers x-autonomy, x-tenant, x-user, x-role)
- (dev) GET /dev/jobboards/proposals

## Headers for /api/features/active
- x-tenant, x-user, x-role

## Quick smoke
curl -s localhost:3000/api/features/active -H 'x-role: cfo' | jq .
curl -s -X POST localhost:3000/api/usage/feature -H 'Content-Type: application/json' -d '{"userId":"u1","featureId":"customer_health","action":"open"}'
curl -s localhost:3000/api/features/active -H 'x-user: u1' -H 'x-role: sales_manager' | jq .
curl -s -X POST localhost:3000/dev/run -H 'Content-Type: application/json' -H 'x-autonomy: 5' -H 'x-role: cfo' -d '{"capability":"finance.invoice.prepareDraft"}' | jq .
curl -s localhost:3000/dev/jobboards/proposals | jq .
```

## Notes
- `roles/roles.json` is loaded automatically if present.
- Role caps gate autonomy levels; if L exceeds cap, response includes degraded mode rationale in `basis`.
```
