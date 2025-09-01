-- Add org_id to domain tables (idempotent)
ALTER TABLE messages  ADD COLUMN org_id TEXT;
ALTER TABLE customers ADD COLUMN org_id TEXT;
ALTER TABLE calendar  ADD COLUMN org_id TEXT;
ALTER TABLE tasks     ADD COLUMN org_id TEXT;
ALTER TABLE deals     ADD COLUMN org_id TEXT;
ALTER TABLE tickets   ADD COLUMN org_id TEXT;
ALTER TABLE meetings  ADD COLUMN org_id TEXT;
-- Indexes (create if not exists)
CREATE INDEX IF NOT EXISTS idx_messages_org_updated  ON messages(org_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_customers_org_updated ON customers(org_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_calendar_org_updated  ON calendar(org_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_tasks_org_updated     ON tasks(org_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_deals_org_updated     ON deals(org_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_tickets_org_updated   ON tickets(org_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_meetings_org_updated  ON meetings(org_id, updated_at);