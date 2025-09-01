CREATE TABLE IF NOT EXISTS connector_flags (
  tenant_id  text NOT NULL,
  connector  text NOT NULL,
  enabled    boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, connector)
);
