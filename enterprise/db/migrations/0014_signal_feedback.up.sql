CREATE TABLE IF NOT EXISTS signal_feedback(
  user_id TEXT NOT NULL,
  signal_id TEXT NOT NULL,
  action TEXT CHECK(action IN ('ignored','acted','snoozed')) NOT NULL,
  ts TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_signal_feedback_user ON signal_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_feedback_signal ON signal_feedback(signal_id);
