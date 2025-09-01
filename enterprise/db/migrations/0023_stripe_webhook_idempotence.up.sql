CREATE TABLE IF NOT EXISTS stripe_events(
  id TEXT PRIMARY KEY,
  received_at TEXT DEFAULT (datetime('now'))
);
