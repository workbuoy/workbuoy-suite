CREATE TABLE IF NOT EXISTS crm_notes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT, body TEXT, created_ts TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS project_tasks(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT, title TEXT, created_ts TEXT DEFAULT (datetime('now'))
);
