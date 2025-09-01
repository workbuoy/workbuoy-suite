
-- Example migration (reference only; runtime uses inline idempotent CREATEs)
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, updated_at INTEGER, payload TEXT);
CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, updated_at INTEGER, payload TEXT);
CREATE TABLE IF NOT EXISTS calendar (id TEXT PRIMARY KEY, updated_at INTEGER, payload TEXT);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, updated_at INTEGER, payload TEXT);
CREATE INDEX IF NOT EXISTS idx_messages_updated ON messages(updated_at);
