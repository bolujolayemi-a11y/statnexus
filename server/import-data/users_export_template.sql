-- Run this in Supabase SQL Editor to export users
-- Save the results as a SQL INSERT file for CockroachDB import

SELECT
  id,
  email,
  encrypted_password AS password_hash,
  created_at,
  (email_confirmed_at IS NOT NULL) AS email_verified
FROM auth.users
ORDER BY created_at;