CREATE TABLE IF NOT EXISTS connector_state (
  tenant_id   text NOT NULL,
  connector   text NOT NULL,
  key         text NOT NULL DEFAULT 'since',
  state       jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, connector, key)
);
