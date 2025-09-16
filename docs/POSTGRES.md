# Postgres quickstart

1. Start a Postgres instance.
2. Run `db/init-tables.sql` against your database.
3. Set env:
```
PERSIST_MODE=pg
USE_PG=1
PG_URL=postgres://user:pass@host:5432/db
```
4. Start app. Services will use PgRepo via autoload shims.
