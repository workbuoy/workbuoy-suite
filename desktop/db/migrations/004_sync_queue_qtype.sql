-- Extend sync_queue with qtype (crm|email|calendar)
ALTER TABLE sync_queue ADD COLUMN qtype TEXT DEFAULT 'crm';