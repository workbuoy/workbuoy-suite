CREATE TABLE IF NOT EXISTS role_kpis(
  role_id TEXT,
  kpi TEXT,
  value REAL,
  ts TEXT DEFAULT (datetime('now'))
);
