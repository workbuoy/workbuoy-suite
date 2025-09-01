-- 0027_audit_log.up.sql
CREATE TABLE IF NOT EXISTS audit_log(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  target TEXT,
  details TEXT,
  ts DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now'))
);
