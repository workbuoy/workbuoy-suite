-- Migration: add dsr_requests table
CREATE TABLE IF NOT EXISTS dsr_requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('access','erasure','rectification','consent')),
  user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','processing','closed','rejected')),
  sla TEXT NOT NULL DEFAULT '30d',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT,
  evidence TEXT
);
CREATE INDEX IF NOT EXISTS idx_dsr_requests_user_email ON dsr_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_dsr_requests_type ON dsr_requests(type);
CREATE INDEX IF NOT EXISTS idx_dsr_requests_status ON dsr_requests(status);
