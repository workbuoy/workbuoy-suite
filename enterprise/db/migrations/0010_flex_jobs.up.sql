-- 0010_flex_jobs.up.sql (sqlite)
CREATE TABLE IF NOT EXISTS flex_jobs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT UNIQUE,
  user_email TEXT,
  type TEXT,
  amount_cents INTEGER,
  status TEXT,
  created_ts TEXT DEFAULT (datetime('now'))
);