CREATE TABLE IF NOT EXISTS last_seen(
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  snapshot TEXT,
  last_seen_ts TEXT DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, entity_type, entity_id)
);
