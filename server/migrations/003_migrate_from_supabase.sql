-- Migration from Supabase to CockroachDB
-- This script handles existing users and preserves data

-- 1. Ensure base schema exists (run 001_init.sql and 002_email_auth.sql first if not done)

-- 2. Add any missing columns to match Supabase schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name STRING;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Create trigger function for auto-creating profiles on user signup
-- Note: In CockroachDB, we handle this at application level instead of triggers
-- This is more reliable for serverless environments and avoids trigger complexity

-- Alternative: Application-level profile creation
-- The signup route in server/src/routes/auth.js should handle profile creation

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);

-- 5. Grant permissions (CockroachDB uses different permission model)
-- Note: In CockroachDB, you typically handle permissions at the application level
-- rather than using database-level RLS like Supabase

-- 6. Create a function to check if user owns data (replacement for RLS)
CREATE OR REPLACE FUNCTION user_owns_profile(user_id UUID, profile_id UUID)
RETURNS BOOL AS $$
BEGIN
  RETURN user_id = profile_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_owns_test_result(user_id UUID, test_result_user_id UUID)
RETURNS BOOL AS $$
BEGIN
  RETURN user_id = test_result_user_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Handle existing users without profiles
-- This ensures data integrity after migration
INSERT INTO profiles (id, full_name, updated_at, syllabus_focus, account_tier)
SELECT u.id, NULL, now(), 'NCLEX-RN', 'STANDARD'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);