CREATE TABLE IF NOT EXISTS signals(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT DEFAULT (datetime('now')),
  type TEXT, title TEXT,
  urgency REAL, impact REAL, severity TEXT,
  payload TEXT
);
