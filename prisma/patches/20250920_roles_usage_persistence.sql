-- Patch migration for roles & usage persistence
CREATE TABLE IF NOT EXISTS Role (
  role_id TEXT PRIMARY KEY,
  title TEXT,
  inherits JSONB,
  feature_caps JSONB,
  scope_hints JSONB
);
CREATE TABLE IF NOT EXISTS Feature (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  default_autonomy_cap INT,
  capabilities JSONB
);
CREATE TABLE IF NOT EXISTS OrgRoleOverride (
  tenant_id TEXT,
  role_id TEXT,
  feature_caps JSONB,
  disabled_features JSONB,
  PRIMARY KEY (tenant_id, role_id)
);
CREATE TABLE IF NOT EXISTS UserRole (
  user_id TEXT PRIMARY KEY,
  primary_role TEXT,
  secondary_roles JSONB
);
CREATE TABLE IF NOT EXISTS FeatureUsage (
  id UUID PRIMARY KEY,
  user_id TEXT,
  feature_id TEXT,
  action TEXT,
  ts TIMESTAMP DEFAULT now()
);
