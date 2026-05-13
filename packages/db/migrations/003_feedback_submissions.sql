CREATE TABLE feedback_submissions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name         TEXT,
  email              TEXT,
  message            TEXT        NOT NULL,
  consent_to_publish BOOLEAN     NOT NULL DEFAULT false,
  status             TEXT        NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin moderation query: index on status + created_at
CREATE INDEX idx_feedback_status_created ON feedback_submissions (status, created_at DESC);
