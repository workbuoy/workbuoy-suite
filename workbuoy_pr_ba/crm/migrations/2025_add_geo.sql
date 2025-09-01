-- Adds geodata fields to CRM entities (example for contacts table)
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS geohash TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS geo_region TEXT;
CREATE INDEX IF NOT EXISTS idx_contacts_lat_lng ON crm_contacts (lat, lng);
