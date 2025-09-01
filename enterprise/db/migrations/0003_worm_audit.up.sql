CREATE TABLE IF NOT EXISTS audit_logs_worm(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT DEFAULT (datetime('now')),
  user_email TEXT,
  action TEXT,
  details TEXT,
  prev_hash TEXT,
  hash TEXT
);
