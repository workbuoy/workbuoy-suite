-- 0025_connector_state.up.sql
CREATE TABLE IF NOT EXISTS connector_state(
  tenant_id TEXT NOT NULL,
  connector TEXT NOT NULL,
  key TEXT NOT NULL DEFAULT 'since',
  state TEXT,
  updated_at DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  PRIMARY KEY(tenant_id, connector, key)
);
