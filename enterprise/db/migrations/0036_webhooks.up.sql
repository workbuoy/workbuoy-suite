
CREATE TABLE IF NOT EXISTS webhook_endpoints(
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT NOT NULL, -- JSON array
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS webhook_deliveries(
  id TEXT PRIMARY KEY,
  endpoint_id TEXT NOT NULL,
  event TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  next_retry_at DATETIME,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
