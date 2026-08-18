-- Run this in Supabase SQL Editor to export users
-- This query exports the users table with password hashes for migration

SELECT
  id,
  email,
  encrypted_password AS password_hash,
  created_at,
  (email_confirmed_at IS NOT NULL) AS email_verified
FROM auth.users
ORDER BY created_at;