
CREATE TABLE stripe_events(
  id TEXT PRIMARY KEY,
  created TIMESTAMP DEFAULT now()
);
CREATE TABLE purchases(
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  kit_id TEXT,
  status TEXT,
  created_ts TIMESTAMP DEFAULT now(),
  download_token TEXT,
  expires_at TIMESTAMP
);
