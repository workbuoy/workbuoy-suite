-- Ensure tenant_connectors has required columns
CREATE TABLE IF NOT EXISTS tenant_connectors(
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  enabled INTEGER DEFAULT 0,
  secret_ref TEXT,
  status TEXT DEFAULT 'pending',
  last_sync_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY(tenant_id, provider)
);
-- Local secrets table for dev/stub backend
CREATE TABLE IF NOT EXISTS secrets_local(
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY(tenant_id, name)
);
