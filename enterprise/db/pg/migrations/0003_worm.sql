-- WORM (append-only) audit: prevent UPDATE/DELETE
CREATE OR REPLACE FUNCTION audit_no_update_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is WORM (append-only)';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;

CREATE TRIGGER audit_logs_no_update BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION audit_no_update_delete();

CREATE TRIGGER audit_logs_no_delete BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION audit_no_update_delete();
