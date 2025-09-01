
CREATE TABLE IF NOT EXISTS idempotency_keys(
  key TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  response_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ttl_seconds INTEGER DEFAULT 86400
);
