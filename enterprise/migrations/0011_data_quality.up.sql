
-- 0011_data_quality.up.sql
CREATE TABLE IF NOT EXISTS data_quality_queue(
  id TEXT PRIMARY KEY,
  user_id TEXT,
  source TEXT,
  payload_json TEXT,
  confidence REAL,
  status TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dq_status ON data_quality_queue(status);
CREATE INDEX IF NOT EXISTS idx_dq_conf ON data_quality_queue(confidence);
CREATE INDEX IF NOT EXISTS idx_dq_created ON data_quality_queue(created_at);

CREATE TABLE IF NOT EXISTS data_quality_changes(
  id TEXT PRIMARY KEY,
  source TEXT,
  before_json TEXT,
  after_json TEXT,
  applied_by TEXT,
  applied_at TEXT DEFAULT (datetime('now')),
  confidence REAL
);
