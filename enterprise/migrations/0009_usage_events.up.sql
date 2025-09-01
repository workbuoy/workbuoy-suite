-- 0009_usage_events.up.sql (sqlite)
CREATE TABLE IF NOT EXISTS usage_events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT DEFAULT (datetime('now')),
  user_email TEXT,
  event_name TEXT,
  module TEXT,
  metadata TEXT
);