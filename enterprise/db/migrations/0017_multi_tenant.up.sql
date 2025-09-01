CREATE TABLE IF NOT EXISTS tenants(id TEXT PRIMARY KEY,name TEXT,created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS org_users(tenant_id TEXT NOT NULL,user_email TEXT NOT NULL,role TEXT CHECK(role IN ('owner','admin','member')) NOT NULL DEFAULT 'owner',added_at TEXT DEFAULT (datetime('now')),PRIMARY KEY(tenant_id,user_email));
CREATE TABLE IF NOT EXISTS secrets(id INTEGER PRIMARY KEY AUTOINCREMENT,tenant_id TEXT NOT NULL,name TEXT NOT NULL,ref_key TEXT NOT NULL,updated_at TEXT DEFAULT (datetime('now')),UNIQUE(tenant_id,name));
CREATE TABLE IF NOT EXISTS tenant_connectors(tenant_id TEXT NOT NULL,provider TEXT NOT NULL,status TEXT CHECK(status IN ('not_connected','pending','connected','failed')) NOT NULL DEFAULT 'not_connected',meta TEXT,updated_at TEXT DEFAULT (datetime('now')),PRIMARY KEY(tenant_id,provider));
CREATE TABLE IF NOT EXISTS usage_counters(tenant_id TEXT NOT NULL,counter_name TEXT NOT NULL,day TEXT NOT NULL,value INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(tenant_id,counter_name,day));
ALTER TABLE audit_logs_worm ADD COLUMN tenant_id TEXT;
ALTER TABLE subscriptions ADD COLUMN tenant_id TEXT;
ALTER TABLE usage_events ADD COLUMN tenant_id TEXT;
CREATE TABLE IF NOT EXISTS magic_links(token TEXT PRIMARY KEY,email TEXT NOT NULL,tenant_id TEXT,created_at TEXT DEFAULT (datetime('now')),consumed_at TEXT);
