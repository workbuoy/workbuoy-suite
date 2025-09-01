
CREATE TABLE IF NOT EXISTS tenant_plan_limits(
  tenant_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  rpm INTEGER DEFAULT 120,
  rpd INTEGER DEFAULT 10000,
  burst INTEGER DEFAULT 60,
  webhook_concurrency INTEGER DEFAULT 5
);
