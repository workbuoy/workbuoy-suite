
ALTER TABLE audit_log ADD COLUMN hash TEXT;
ALTER TABLE audit_log ADD COLUMN prev_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_audit_tenant_ts ON audit_log(tenant_id, ts);
