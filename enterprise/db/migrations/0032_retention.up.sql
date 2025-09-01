
CREATE TABLE IF NOT EXISTS retention_policy(
  table_name TEXT PRIMARY KEY,
  ttl_days INTEGER NOT NULL
);
