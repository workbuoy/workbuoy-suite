CREATE TABLE IF NOT EXISTS invites(
  token TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','member')),
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT DEFAULT (datetime('now','+7 days')),
  accepted_at TEXT
);
