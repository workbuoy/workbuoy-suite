CREATE TABLE IF NOT EXISTS integrations_status(
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT CHECK(status IN ('not_connected','pending','connected','failed')) NOT NULL DEFAULT 'not_connected',
  meta TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, provider)
);
