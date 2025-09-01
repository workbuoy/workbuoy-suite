CREATE TABLE IF NOT EXISTS quotas (
  tenant_id  text PRIMARY KEY,
  plan       text NOT NULL,
  limit_monthly_events integer NOT NULL,
  limit_connectors integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_events (
  id         bigserial PRIMARY KEY,
  tenant_id  text NOT NULL,
  kind       text NOT NULL,
  amount     integer NOT NULL,
  ts         timestamptz NOT NULL DEFAULT now()
);
