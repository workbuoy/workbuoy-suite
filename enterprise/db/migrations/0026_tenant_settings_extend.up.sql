-- 0026_tenant_settings_extend.up.sql
ALTER TABLE tenant_settings ADD COLUMN demo_dataset_enabled INTEGER DEFAULT 0;
ALTER TABLE tenant_settings ADD COLUMN features TEXT DEFAULT '{}';
