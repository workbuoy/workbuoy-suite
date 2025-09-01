

## Queue & jobs
- BullMQ via `REDIS_URL`, ellers in-memory fallback. API enqueuer resync/erasure.
- Metrikker beholdes, og audit-events for jobbkø-aksjoner.

## Secrets
- `SECRETS_PROVIDER` (env/aws/azure/gcp) – repo bruker ENV fallback.
