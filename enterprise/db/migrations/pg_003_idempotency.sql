CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         text PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now()
);
