-- StatNexus schema for CockroachDB (replaces Supabase auth + public tables)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email STRING UNIQUE NOT NULL,
  password_hash STRING NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name STRING,
  updated_at TIMESTAMPTZ DEFAULT now(),
  syllabus_focus STRING DEFAULT 'NCLEX-RN',
  account_tier STRING DEFAULT 'STANDARD'
);

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_type STRING NOT NULL,
  score INT NOT NULL,
  questions_count INT NOT NULL,
  duration_minutes INT DEFAULT 0,
  user_answers JSONB,
  questions JSONB,
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at DESC);
