CREATE TABLE IF NOT EXISTS user_goals(
  user_id TEXT NOT NULL,
  role TEXT,
  kpi_name TEXT,
  target_value REAL,
  stakeholder_tags TEXT,
  weights_override TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, kpi_name)
);
