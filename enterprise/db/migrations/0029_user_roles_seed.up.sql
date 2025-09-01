
CREATE TABLE IF NOT EXISTS user_roles(
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','user','readonly')),
  PRIMARY KEY(tenant_id, user_id)
);
-- Seed policy: first seen user per tenant becomes admin (handled in seed script).
