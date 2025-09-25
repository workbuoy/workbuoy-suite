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
