
-- migrations/20250825_add_data_quality_log.sql
CREATE TABLE IF NOT EXISTS data_quality_log (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  quality_score NUMERIC NOT NULL,
  quality_issues JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
