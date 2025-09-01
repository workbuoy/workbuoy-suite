-- db/migrations/0012_integration_health.sql
-- Extends the integration_health schema with error counters and timing.
-- This migration is idempotent (IF NOT EXISTS).

DO $$ BEGIN
  -- Ensure table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'integration_health'
  ) THEN
    CREATE TABLE integration_health (
      connector TEXT PRIMARY KEY,
      last_success_at TIMESTAMPTZ,
      last_error_at TIMESTAMPTZ,
      last_latency_ms INTEGER,
      error_count_total BIGINT NOT NULL DEFAULT 0,
      consecutive_errors INTEGER NOT NULL DEFAULT 0
    );
  END IF;
END $$;

-- Add columns if missing
DO $$ BEGIN
  BEGIN
    ALTER TABLE integration_health ADD COLUMN IF NOT EXISTS last_success_at TIMESTAMPTZ;
  EXCEPTION WHEN duplicate_column THEN END;
  BEGIN
    ALTER TABLE integration_health ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ;
  EXCEPTION WHEN duplicate_column THEN END;
  BEGIN
    ALTER TABLE integration_health ADD COLUMN IF NOT EXISTS last_latency_ms INTEGER;
  EXCEPTION WHEN duplicate_column THEN END;
  BEGIN
    ALTER TABLE integration_health ADD COLUMN IF NOT EXISTS error_count_total BIGINT NOT NULL DEFAULT 0;
  EXCEPTION WHEN duplicate_column THEN END;
  BEGIN
    ALTER TABLE integration_health ADD COLUMN IF NOT EXISTS consecutive_errors INTEGER NOT NULL DEFAULT 0;
  EXCEPTION WHEN duplicate_column THEN END;
END $$;

CREATE INDEX IF NOT EXISTS idx_integration_health_last_success ON integration_health (last_success_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_health_last_error ON integration_health (last_error_at DESC);
