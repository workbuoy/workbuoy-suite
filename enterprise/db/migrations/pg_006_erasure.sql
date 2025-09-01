CREATE TABLE IF NOT EXISTS erasure_requests (
  id           bigserial PRIMARY KEY,
  subject_id   text NOT NULL,
  requested_by text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now()
);
