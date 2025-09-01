-- Signals perf view (example)
CREATE OR REPLACE VIEW wb_signals_perf AS
SELECT date_trunc('minute', created_at) AS minute, count(*) AS events
FROM audit_logs
GROUP BY 1
ORDER BY 1 DESC;
