-- 0015_meta_experiments.up.sql (sqlite)
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS experiments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  goal TEXT,
  -- JSON string: { "p95_latency_ms": number, "error_rate_threshold": number }
  sla_target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running', -- running|stopped|rolled_back|promoted
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS experiment_assignments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TEXT DEFAULT (datetime('now')),
  UNIQUE(experiment_id, user_id),
  FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiment_events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id INTEGER NOT NULL,
  ts TEXT DEFAULT (datetime('now')),
  metric TEXT NOT NULL,          -- e.g. latency_ms, error_rate, conversion, etc.
  value REAL NOT NULL,
  metadata TEXT,                 -- optional JSON for extra tags (variant, route, etc.)
  FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_experiment_events_exp ON experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_metric ON experiment_events(metric);
CREATE INDEX IF NOT EXISTS idx_experiment_events_ts ON experiment_events(ts);

-- Link to WORM audit table if not present (no-op if it already exists)
CREATE TABLE IF NOT EXISTS audit_logs_worm(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT DEFAULT (datetime('now')),
  actor TEXT,
  action TEXT,
  resource TEXT,
  details TEXT,
  prev_hash TEXT,
  hash TEXT
);
