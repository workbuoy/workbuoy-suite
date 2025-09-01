
-- 0016_secure_dsr.up.sql
CREATE TABLE IF NOT EXISTS dsr_requests (
  id INTEGER PRIMARY KEY,
  type TEXT,
  user_email TEXT,
  status TEXT,
  sla_hours INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  evidence JSON
);
CREATE TABLE IF NOT EXISTS consents (
  id INTEGER PRIMARY KEY,
  user_email TEXT,
  purpose TEXT,
  status TEXT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
