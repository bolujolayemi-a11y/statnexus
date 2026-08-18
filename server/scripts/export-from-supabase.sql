-- Run these in the Supabase SQL Editor, then export each result as CSV
-- (Download button in the results panel) and save into server/import-data/

-- 1) Users (includes bcrypt password hashes — existing passwords will keep working)
SELECT
  id,
  email,
  encrypted_password AS password_hash,
  created_at,
  (email_confirmed_at IS NOT NULL) AS email_verified
FROM auth.users
ORDER BY created_at;

-- 2) Profiles
SELECT
  id,
  full_name,
  updated_at,
  syllabus_focus,
  account_tier
FROM public.profiles
ORDER BY updated_at;

-- 3) Test results
SELECT
  id,
  user_id,
  exam_type,
  score,
  questions_count,
  duration_minutes,
  user_answers,
  questions,
  completed_at
FROM public.test_results
ORDER BY completed_at;
