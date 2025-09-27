# Backend seeding

Run database migrations, then seed baseline roles/features:

```
npm run prisma:migrate:deploy -w @workbuoy/backend
npm run seed:roles -w @workbuoy/backend
```

To verify the script without a database connection (dry run):

```
npm run seed:dry-run -w @workbuoy/backend
```

## Metrics bridge

Enable metrics locally by starting the backend with `METRICS_ENABLED=true`:

```
METRICS_ENABLED=true npm run dev -w @workbuoy/backend
```

Then fetch the Prometheus snapshot:

```
curl http://localhost:3000/metrics
```
