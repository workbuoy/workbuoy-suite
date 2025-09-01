
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  roles TEXT NOT NULL
);
CREATE TABLE audit_logs(
  id SERIAL PRIMARY KEY,
  ts TIMESTAMP DEFAULT now(),
  user_email TEXT,
  action TEXT,
  details JSONB,
  request_id TEXT
);
