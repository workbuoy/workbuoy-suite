-- If using Prisma's generated migrations, run this extra script to enforce WORM on audit_events
CREATE OR REPLACE FUNCTION audit_events_prevent_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events rows are immutable (WORM)';
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_events_no_update'
  ) THEN
    CREATE TRIGGER audit_events_no_update BEFORE UPDATE ON audit_events
    FOR EACH ROW EXECUTE PROCEDURE audit_events_prevent_change();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_events_no_delete'
  ) THEN
    CREATE TRIGGER audit_events_no_delete BEFORE DELETE ON audit_events
    FOR EACH ROW EXECUTE PROCEDURE audit_events_prevent_change();
  END IF;
END$$;