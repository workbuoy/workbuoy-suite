-- Create sync_queue for offline-first writes
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL CHECK (entity IN ('deal','ticket','task','meeting')),
  entity_id TEXT,
  op TEXT NOT NULL CHECK (op IN ('create','update','delete')),
  payload TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','inflight','failed','synced')),
  attempt INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status, updated_at);