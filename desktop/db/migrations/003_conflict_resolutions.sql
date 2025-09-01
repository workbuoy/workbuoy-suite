-- Record how conflicts were resolved
CREATE TABLE IF NOT EXISTS conflict_resolutions (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  resolved_by TEXT NOT NULL, -- 'keepLocal' | 'keepServer'
  resolved_at INTEGER NOT NULL,
  resolution TEXT NOT NULL,
  note TEXT
);