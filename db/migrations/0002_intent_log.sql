-- Optional DB table (future) for IntentLog snapshots.
-- Apply later when Postgres is introduced.
CREATE TABLE IF NOT EXISTS intent_log (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  capability TEXT NOT NULL,
  payload JSONB NOT NULL,
  policy JSONB NOT NULL,
  mode TEXT CHECK (mode IN ('integration','simulate')) NOT NULL,
  outcome JSONB,
  created_at TIMESTAMP DEFAULT now()
);
