CREATE TABLE IF NOT EXISTS erasure_tokens(
  token TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  confirmed_at TEXT
);
CREATE TABLE IF NOT EXISTS erasure_jobs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued|running|done|failed
  stats TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT,
  duration_sec INTEGER
);
