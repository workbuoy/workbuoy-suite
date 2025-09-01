-- Extend sync_queue with org_id, wf_id (workflow batch) and step_index
ALTER TABLE sync_queue ADD COLUMN org_id TEXT;
ALTER TABLE sync_queue ADD COLUMN wf_id TEXT;
ALTER TABLE sync_queue ADD COLUMN step_index INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_sync_queue_org_status ON sync_queue(org_id, status, updated_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_wf ON sync_queue(wf_id, step_index, status);