CREATE TABLE IF NOT EXISTS roles (
  role_id TEXT PRIMARY KEY,
  title TEXT,
  inherits TEXT[] DEFAULT '{}',
  feature_caps JSONB DEFAULT '{}'::jsonb,
  scope_hints JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS org_role_overrides (
  tenant_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  feature_caps JSONB DEFAULT '{}'::jsonb,
  disabled_features TEXT[] DEFAULT '{}',
  PRIMARY KEY (tenant_id, role_id)
);

CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  default_autonomy_cap SMALLINT,
  capabilities TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT PRIMARY KEY,
  primary_role TEXT NOT NULL,
  secondary_roles TEXT[] DEFAULT '{}'
);
