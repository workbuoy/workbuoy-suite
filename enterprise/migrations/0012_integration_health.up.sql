
-- 0012_integration_health.up.sql
CREATE TABLE IF NOT EXISTS integration_health(
  connector TEXT PRIMARY KEY,
  status TEXT,
  last_success_at TEXT,
  open_errors INTEGER DEFAULT 0,
  p95_ms REAL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ih_status ON integration_health(status);
