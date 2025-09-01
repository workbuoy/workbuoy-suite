CREATE TABLE IF NOT EXISTS tenants(id text PRIMARY KEY,name text,created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS org_users(tenant_id text NOT NULL,user_email text NOT NULL,role text CHECK(role IN ('owner','admin','member')) NOT NULL DEFAULT 'owner',added_at timestamptz default now(),PRIMARY KEY(tenant_id,user_email));
CREATE TABLE IF NOT EXISTS secrets(id serial PRIMARY KEY,tenant_id text NOT NULL,name text NOT NULL,ref_key text NOT NULL,updated_at timestamptz default now(),UNIQUE(tenant_id, name));
CREATE TABLE IF NOT EXISTS tenant_connectors(tenant_id text NOT NULL,provider text NOT NULL,status text CHECK(status IN ('not_connected','pending','connected','failed')) NOT NULL DEFAULT 'not_connected',meta jsonb,updated_at timestamptz default now(),PRIMARY KEY(tenant_id,provider));
CREATE TABLE IF NOT EXISTS usage_counters(tenant_id text NOT NULL,counter_name text NOT NULL,day date NOT NULL,value integer NOT NULL default 0,PRIMARY KEY(tenant_id,counter_name,day));
ALTER TABLE audit_logs_worm ADD COLUMN IF NOT EXISTS tenant_id text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tenant_id text;
ALTER TABLE usage_events ADD COLUMN IF NOT EXISTS tenant_id text;
CREATE TABLE IF NOT EXISTS magic_links(token text PRIMARY KEY,email text NOT NULL,tenant_id text,created_at timestamptz default now(),consumed_at timestamptz);
