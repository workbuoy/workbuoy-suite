
-- 0014_perf_views.up.sql
-- Create materialized-like indexed views/tables for optimized scoring queries (SQLite doesn't support materialized views natively)
CREATE TABLE IF NOT EXISTS signals_perf_view AS
SELECT id, ts, type, title, urgency, impact, severity, json_extract(payload,'$.decay') as decay
FROM signals;
CREATE INDEX IF NOT EXISTS idx_spv_ts ON signals_perf_view(ts);
CREATE INDEX IF NOT EXISTS idx_spv_type ON signals_perf_view(type);
