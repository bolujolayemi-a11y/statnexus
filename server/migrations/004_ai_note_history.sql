-- Saved AI note searches so users can revisit topics they have studied before

CREATE TABLE IF NOT EXISTS ai_note_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic STRING NOT NULL,
  note JSONB,
  search_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_searched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_ai_note_history_user_id ON ai_note_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_note_history_last_searched ON ai_note_history(last_searched_at DESC);