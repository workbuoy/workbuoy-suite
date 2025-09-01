CREATE TABLE IF NOT EXISTS worm_audit (
  id         bigserial PRIMARY KEY,
  ts         timestamptz NOT NULL DEFAULT now(),
  prev_hash  varchar(64) NOT NULL,
  payload    text NOT NULL,
  hash       varchar(64) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_worm_audit_ts ON worm_audit (ts);
