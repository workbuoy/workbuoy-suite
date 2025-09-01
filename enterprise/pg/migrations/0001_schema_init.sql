-- PG schema init
CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_sha256 TEXT NOT NULL,
  roles TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS purchases(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs(
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor TEXT,
  user_email TEXT,
  action TEXT,
  details JSONB,
  request_id TEXT
);

CREATE TABLE IF NOT EXISTS _migrations(
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
