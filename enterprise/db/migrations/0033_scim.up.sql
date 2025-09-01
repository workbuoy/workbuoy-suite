
CREATE TABLE IF NOT EXISTS scim_users(
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  userName TEXT NOT NULL,
  givenName TEXT,
  familyName TEXT,
  active INTEGER DEFAULT 1,
  raw JSON
);
CREATE TABLE IF NOT EXISTS scim_groups(
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  displayName TEXT NOT NULL,
  raw JSON
);
CREATE TABLE IF NOT EXISTS scim_group_members(
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (group_id, user_id)
);
