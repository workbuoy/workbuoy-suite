
-- 0013_retry_dlq.up.sql
CREATE TABLE IF NOT EXISTS retry_queue(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connector TEXT,
  op_type TEXT,
  payload_json TEXT,
  retry_at TEXT,
  attempts INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_rq_retry_at ON retry_queue(retry_at);
CREATE INDEX IF NOT EXISTS idx_rq_connector ON retry_queue(connector);
CREATE TABLE IF NOT EXISTS dlq(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connector TEXT,
  payload_json TEXT,
  failed_reason TEXT,
  failed_at TEXT DEFAULT (datetime('now'))
);
