
CREATE TABLE IF NOT EXISTS pii_policy(
  field TEXT PRIMARY KEY,
  class TEXT NOT NULL, -- e.g., email,name,phone,address
  mask_strategy TEXT NOT NULL -- e.g., full, partial, hash
);
