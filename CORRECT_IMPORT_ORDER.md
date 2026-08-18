# Correct Import Order for CockroachDB Migration

The foreign key constraint error occurs because you're trying to import profiles before users exist. The correct order is:

## Import Order (Critical!)

1. **Users** (must be first - profiles reference users)
2. **Profiles** (depends on users)  
3. **Test Results** (depends on profiles)

## Step-by-Step Instructions

### Step 1: Export Users from Supabase

1. Open Supabase SQL Editor
2. Run this query:

```sql
SELECT
  id,
  email,
  encrypted_password AS password_hash,
  created_at,
  (email_confirmed_at IS NOT NULL) AS email_verified
FROM auth.users
ORDER BY created_at;
```

3. Click "Download" and save as SQL INSERT format
4. Save as `server/import-data/users.sql`

**Format should be:**
```sql
INSERT INTO users (id, email, password_hash, created_at, email_verified) VALUES
('uuid-1', 'email1@example.com', 'hash1', '2026-06-03 13:43:17.017752+00', true),
('uuid-2', 'email2@example.com', 'hash2', '2026-06-03 15:44:21.616601+00', false)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  email_verified = EXCLUDED.email_verified;
```

### Step 2: Import Users to CockroachDB

1. Open CockroachDB Cloud SQL Editor
2. Run the users import first:

```sql
-- Paste your users.sql content here
INSERT INTO users (id, email, password_hash, created_at, email_verified) VALUES
-- ... your user data
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  email_verified = EXCLUDED.email_verified;
```

3. Verify users imported:
```sql
SELECT COUNT(*) FROM users;
-- Should show the number of users you exported
```

### Step 3: Import Profiles (After Users)

1. Now run the profiles import:
```sql
-- Paste profiles.sql content
INSERT INTO "public"."profiles" ("id", "full_name", "updated_at", "syllabus_focus", "account_tier") VALUES 
-- ... your profile data
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = EXCLUDED.updated_at,
  syllabus_focus = EXCLUDED.syllabus_focus,
  account_tier = EXCLUDED.account_tier;
```

2. Verify profiles imported:
```sql
SELECT COUNT(*) FROM profiles;
-- Should show 21 profiles
```

### Step 4: Import Test Results (After Profiles)

1. Run test results imports:
```sql
-- Paste test_results.sql content
INSERT INTO "public"."test_results" ("id", "user_id", "exam_type", "score", "questions_count", "completed_at", "duration_minutes", "user_answers", "questions") VALUES 
-- ... your test results data
ON CONFLICT (id) DO NOTHING;
```

2. Verify test results:
```sql
SELECT COUNT(*) FROM test_results;
```

## Verification

After all imports, run this to verify relationships:

```sql
-- Check user-profile relationships
SELECT u.email, p.full_name, p.syllabus_focus
FROM users u
LEFT JOIN profiles p ON u.id = p.id
LIMIT 10;

-- Check test results with user info
SELECT tr.id, tr.exam_type, tr.score, p.full_name
FROM test_results tr
JOIN profiles p ON tr.user_id = p.id
LIMIT 10;

-- Verify all users have profiles
SELECT u.id, u.email
FROM users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
-- Should return 0 rows (all users have profiles)
```

## Alternative: Use Node.js Import Script

If SQL import is too complex, use the provided Node.js script which handles order automatically:

```bash
cd server
node scripts/import-supabase.js
```

The script automatically:
1. Imports users first
2. Then profiles
3. Then test results
4. Handles foreign key constraints properly

## Troubleshooting

### Foreign Key Violations

**Problem**: "violates foreign key constraint"
**Solution**: Ensure you're importing in the correct order: users → profiles → test_results

### Missing Users

**Problem**: Profiles reference non-existent users
**Solution**: Always import users first, verify with `SELECT COUNT(*) FROM users;`

### Duplicate IDs

**Problem**: "duplicate key value violates unique constraint"
**Solution**: The `ON CONFLICT` clauses should handle this, but check your data for duplicates

## Data Recovery

If imports fail, you can clear and restart:

```sql
-- Clear imported data (in reverse order)
DELETE FROM test_results;
DELETE FROM profiles;
DELETE FROM users;

-- Restart import process
```

## Important Notes

- **Order matters**: Users must exist before profiles
- **Verification**: Check each step before proceeding
- **Backups**: Keep your Supabase exports until migration is verified
- **Testing**: Test with a small subset first if you have many users