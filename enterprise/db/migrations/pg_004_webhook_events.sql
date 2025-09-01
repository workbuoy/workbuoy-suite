CREATE TABLE IF NOT EXISTS webhook_events (
  source    text NOT NULL,
  nonce     text NOT NULL,
  ts        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, nonce)
);
