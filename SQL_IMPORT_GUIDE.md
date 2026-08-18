# SQL Format Import Guide for CockroachDB Cloud

This guide focuses on importing your Supabase data using SQL INSERT statements, which is ideal for CockroachDB Cloud's SQL Editor.

## Prerequisites

- CockroachDB Cloud cluster set up
- Schema migrations completed (001_init.sql, 002_email_auth.sql, 003_migrate_from_supabase.sql)
- Exported SQL files from Supabase

## Export Format

Your exported data should be in SQL INSERT format:

```sql
INSERT INTO "public"."profiles" ("id", "full_name", "updated_at", "syllabus_focus", "account_tier") VALUES 
('uuid-1', 'User Name', '2026-06-03 13:43:17.017752+00', 'NCLEX-RN', 'STANDARD'),
('uuid-2', 'Another User', '2026-06-03 15:44:21.616601+00', 'NCLEX-RN', 'STANDARD')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = EXCLUDED.updated_at,
  syllabus_focus = EXCLUDED.syllabus_focus,
  account_tier = EXCLUDED.account_tier;
```

## Import Steps

### 1. Prepare Your SQL Files

Organize your exported SQL files:

```
server/import-data/
├── users.sql          # (if you exported users table)
├── profiles.sql       # User profile data
├── test_results.sql   # Test results (may need splitting)
└── test_results_part2.sql  # Additional test results if needed
```

### 2. Import Users (if applicable)

If you exported users from Supabase auth.users:

1. Open CockroachDB Cloud Console
2. Navigate to SQL Editor
3. Open and copy `server/import-data/users.sql`
4. Paste into SQL Editor and execute

**Note**: Your users.sql should use the column mapping:
- `auth.users.id` → `users.id`
- `auth.users.email` → `users.email`
- `auth.users.encrypted_password` → `users.password_hash`
- `auth.users.created_at` → `users.created_at`
- `auth.users.email_confirmed_at` → `users.email_verified`

### 3. Import Profiles

1. In CockroachDB Cloud SQL Editor
2. Open and copy `server/import-data/profiles.sql`
3. Paste into SQL Editor and execute
4. Verify import: `SELECT COUNT(*) FROM profiles;`

### 4. Import Test Results

Due to the large size of test results data, you may need to split it:

**Option A: Small Datasets**
- Run `test_results.sql` directly in SQL Editor

**Option B: Large Datasets**
- Split into multiple files (test_results_part1.sql, test_results_part2.sql, etc.)
- Run each file separately
- Wait for each to complete before running the next

**Option C: Use Node.js Script**
- For very large datasets, use `node server/scripts/import-supabase.js`
- This handles large files better than the SQL Editor

### 5. Verify Import

Run these verification queries in the SQL Editor:

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check profile count  
SELECT COUNT(*) FROM profiles;

-- Check test results count
SELECT COUNT(*) FROM test_results;

-- Verify user-profile relationships
SELECT u.email, p.full_name, p.syllabus_focus
FROM users u
LEFT JOIN profiles p ON u.id = p.id
LIMIT 10;

-- Check test results with user info
SELECT tr.id, tr.exam_type, tr.score, p.full_name
FROM test_results tr
JOIN profiles p ON tr.user_id = p.id
LIMIT 10;
```

## Handling Large Files

### Splitting Large test_results Files

If your test_results export is too large:

1. Split the INSERT statements into chunks of ~50 records each
2. Save as separate files: `test_results_part1.sql`, `test_results_part2.sql`, etc.
3. Add `ON CONFLICT (id) DO NOTHING;` to each file
4. Run each file sequentially in the SQL Editor

### Example Chunk Format

```sql
-- test_results_part1.sql
INSERT INTO "public"."test_results" ("id", "user_id", "exam_type", "score", "questions_count", "completed_at", "duration_minutes", "user_answers", "questions") VALUES 
('uuid-1', 'user-uuid-1', 'NMCN-RN', 70, 10, '2026-06-03 14:02:22.298964+00', 1, '{"0":"C"}', '[{"id":"nmcn_111"}]'),
('uuid-2', 'user-uuid-2', 'NMCN-RN', 60, 10, '2026-06-03 14:18:26.715059+00', 2, '{"0":"C"}', '[{"id":"nmcn_017"}]')
-- ... up to ~50 records
ON CONFLICT (id) DO NOTHING;
```

## Troubleshooting

### SQL Editor Timeouts

**Problem**: Large INSERT statements timeout in SQL Editor
**Solution**: 
- Split files into smaller chunks
- Use Node.js import script instead
- Increase SQL Editor timeout settings (if available)

### Duplicate Key Errors

**Problem**: `ON CONFLICT` clause not working
**Solution**:
- Ensure your SQL files include `ON CONFLICT (id) DO NOTHING/UPDATE`
- Check that the conflict column matches your primary key
- For profiles: `ON CONFLICT (id) DO UPDATE ...`
- For test_results: `ON CONFLICT (id) DO NOTHING`

### JSON Data Issues

**Problem**: JSON columns (user_answers, questions) causing errors
**Solution**:
- Ensure JSON is properly formatted
- Use single quotes for the outer string, double quotes for JSON keys
- Escape single quotes within JSON strings: `''` instead of `'`

### Foreign Key Violations

**Problem**: `foreign key violation` errors
**Solution**:
- Import users first (if applicable)
- Import profiles second
- Import test results last
- Ensure all user_ids in test_results exist in profiles table

## Alternative: Node.js Import Script

If SQL import proves difficult:

```bash
# Convert your SQL INSERT format to CSV/JSON
# Then use the Node.js script

cd server
node scripts/import-supabase.js
```

This script handles:
- Large file sizes
- Format conversion
- Error handling
- Progress reporting

## Post-Import Verification

After import, test your application:

1. **Authentication**: Try logging in with an existing user
2. **Profile Access**: Verify profile data loads correctly
3. **Test History**: Check that test results appear in user history
4. **New Data**: Create a new test result to ensure functionality

## Rollback Plan

If import fails:

```sql
-- Clear imported data
DELETE FROM test_results;
DELETE FROM profiles;
DELETE FROM users;

-- Re-run import with fixes
```

## Best Practices

1. **Backup First**: Always backup CockroachDB database before import
2. **Test Small**: Import a few records first to test format
3. **Monitor Performance**: Watch SQL Editor performance during import
4. **Verify Data**: Check record counts and sample data after import
5. **Keep Originals**: Save original Supabase exports until migration is verified

## Support

If you encounter issues:
- Check CockroachDB Cloud logs
- Verify SQL syntax in exported files
- Test with smaller data subsets first
- Consider using the Node.js import script as fallback