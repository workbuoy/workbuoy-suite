-- Initial CRM schema (PR A). If you prefer Prisma Migrate to generate this, treat this file as reference.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS pipelines (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  description text,
  owner_id text,
  tags text[] NOT NULL DEFAULT '{}',
  custom_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pipelines_tenant_id_id ON pipelines (tenant_id, id);

CREATE TABLE IF NOT EXISTS stages (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  pipeline_id text NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_index int NOT NULL,
  owner_id text,
  tags text[] NOT NULL DEFAULT '{}',
  custom_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stages_tenant_pipeline ON stages (tenant_id, pipeline_id);

CREATE TABLE IF NOT EXISTS organizations (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  website text,
  domain text,
  owner_id text,
  tags text[] NOT NULL DEFAULT '{}',
  custom_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orgs_tenant_id_id ON organizations (tenant_id, id);

CREATE TABLE IF NOT EXISTS contacts (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  email citext,
  phone text,
  organization_id text REFERENCES organizations(id),
  owner_id text,
  tags text[] NOT NULL DEFAULT '{}',
  custom_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id_id ON contacts (tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_email ON contacts (tenant_id, email);

CREATE TABLE IF NOT EXISTS opportunities (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  pipeline_id text NOT NULL REFERENCES pipelines(id),
  stage_id text NOT NULL REFERENCES stages(id),
  organization_id text REFERENCES organizations(id),
  title text NOT NULL,
  value_cents bigint,
  currency text,
  status text,
  owner_id text,
  tags text[] NOT NULL DEFAULT '{}',
  custom_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_opp_tenant_pipeline ON opportunities (tenant_id, pipeline_id);
CREATE INDEX IF NOT EXISTS idx_opp_tenant_stage ON opportunities (tenant_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_opp_tenant_owner ON opportunities (tenant_id, owner_id);

CREATE TABLE IF NOT EXISTS opportunity_contacts (
  tenant_id text NOT NULL,
  opportunity_id text NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  contact_id text NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, opportunity_id, contact_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  actor_user_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  trace_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_entity ON audit_events (tenant_id, entity_type, entity_id);

-- WORM: prevent updates/deletes on audit_events
CREATE OR REPLACE FUNCTION audit_events_prevent_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events rows are immutable (WORM)';
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_events_no_update'
  ) THEN
    CREATE TRIGGER audit_events_no_update BEFORE UPDATE ON audit_events
    FOR EACH ROW EXECUTE PROCEDURE audit_events_prevent_change();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_events_no_delete'
  ) THEN
    CREATE TRIGGER audit_events_no_delete BEFORE DELETE ON audit_events
    FOR EACH ROW EXECUTE PROCEDURE audit_events_prevent_change();
  END IF;
END$$;