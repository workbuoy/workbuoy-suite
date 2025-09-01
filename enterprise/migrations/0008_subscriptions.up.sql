-- 0008_subscriptions.up.sql (sqlite)
ALTER TABLE users ADD COLUMN selected_module TEXT;
ALTER TABLE users ADD COLUMN role_id TEXT;
ALTER TABLE users ADD COLUMN company TEXT;
CREATE TABLE IF NOT EXISTS subscriptions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT,
  module TEXT,
  plan TEXT,
  status TEXT,
  current_period_end TEXT,
  trial_end TEXT
);