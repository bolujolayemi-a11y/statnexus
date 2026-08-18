# Migration Guide: Supabase to CockroachDB

This guide will help you migrate your StatNexus application from Supabase to CockroachDB while preserving existing users and data.

## Overview

The migration involves:
1. Setting up CockroachDB schema
2. Exporting data from Supabase
3. Importing data to CockroachDB
4. Updating application configuration
5. Testing the migration

## Prerequisites

- CockroachDB Cloud account and cluster
- Access to Supabase SQL Editor
- Node.js environment for running migration scripts
- Existing Supabase database with users and data
- `cockroach` command-line tool (optional, for CLI operations)

## Step 1: Set Up CockroachDB Cloud

### 1.1 Create CockroachDB Cloud Cluster

1. Log in to [CockroachDB Cloud Console](https://console.cockroachlabs.com/)
2. Create a new cluster (choose a region close to your users)
3. Wait for the cluster to be provisioned

### 1.2 Get Connection String

1. In your cluster, go to "Connect" or "Connection Parameters"
2. Select "General" connection string
3. Copy the connection string (format: `postgresql://user:password@host:26257/dbname?sslmode=require`)

### 1.3 Run Schema Migrations

You have two options:

**Option A: Using CockroachDB Cloud Console (Web UI)**
1. Go to your  cluster in CockroachDB Cloud Console
2. Click "SQL Console" or "Execute SQL"
3. Run each migration script in order by copying/pasting the content:
   - `server/migrations/001_init.sql`
   - `server/migrations/002_email_auth.sql`
   - `server/migrations/003_migrate_from_supabase.sql`

**Option B: Using psql (Command Line)**
```bash
# From the server directory
cd server

# Run base schema migration
psql "YOUR_COCKROACHDB_CONNECTION_STRING" -f migrations/001_init.sql

# Run email auth migration
psql "YOUR_COCKROACHDB_CONNECTION_STRING" -f migrations/002_email_auth.sql

# Run Supabase migration schema
psql "YOUR_COCKROACHDB_CONNECTION_STRING" -f migrations/003_migrate_from_supabase.sql
```

## Step 2: Export Data from Supabase

### Option A: SQL Format (Recommended for CockroachDB Cloud)

1. Open Supabase SQL Editor
2. Run the queries from `server/scripts/export-from-supabase.sql`
3. For each query result, click "Download" and save as SQL INSERT statements
4. Save the files to `server/import-data/` directory:

```
server/import-data/
├── users.sql
├── profiles.sql
└── test_results.sql
```

**Note**: SQL format is ideal for CockroachDB Cloud as you can run these directly in the SQL Editor.

### Option B: CSV/JSON Format

1. Open Supabase SQL Editor
2. Run the queries from `server/scripts/export-from-supabase.sql`
3. For each query result, click "Download" and save as CSV or JSON
4. Save the files to `server/import-data/` directory:

```
server/import-data/
├── users.csv (or users.json)
├── profiles.csv (or profiles.json)
└── test_results.csv (or test_results.json)
```

**Note**: If using CSV/JSON format, you'll need to use the Node.js import script.

## Step 3: Import Data to CockroachDB

### Option A: Using SQL Files (Recommended for CockroachDB Cloud)

1. Ensure your CockroachDB Cloud connection string is set in `.env`:

```env
DATABASE_URL=postgresql://user:password@global-url.cockroachlabs.cloud:26257/statnexus?sslmode=require
```

**Note**: Get the exact connection string from your CockroachDB Cloud Console under "Connection Parameters".

2. Place your exported SQL files in `server/import-data/`:
   - `users.sql` (if you exported users)
   - `profiles.sql` 
   - `test_results.sql` (may be split into multiple files if large)

3. In CockroachDB Cloud Console SQL Editor, run the SQL files in order:
   - First: `users.sql` (if you have it)
   - Second: `profiles.sql`
   - Third: `test_results.sql` (and any parts)

4. For large test_results files, you may need to run them in chunks to avoid timeouts.

### Option B: Using Node.js Import Script (for CSV/JSON)

1. Ensure your CockroachDB Cloud connection string is set in `.env`:

```env
DATABASE_URL=postgresql://user:password@global-url.cockroachlabs.cloud:26257/statnexus?sslmode=require
```

2. Create the import directory:

```bash
mkdir -p server/import-data
```

3. Place your exported CSV/JSON files in `server/import-data/`

4. Run the import script:

```bash
cd server
node scripts/import-supabase.js
```

The script will:
- Import users with their password hashes (existing passwords will work)
- Import profiles with user settings
- Import test results
- Handle conflicts gracefully using `ON CONFLICT` clauses

## Step 4: Key Differences to Note

### Authentication
- **Supabase**: Uses `auth.users` table with built-in auth
- **CockroachDB**: Uses custom `users` table with JWT-based auth
- **Impact**: Your existing users' passwords will continue to work (bcrypt hashes are preserved)

### Row Level Security (RLS)
- **Supabase**: Uses PostgreSQL RLS policies
- **CockroachDB**: Uses application-level authorization (middleware)
- **Impact**: Your Express middleware (`requireAuth`) handles user data access control

### Triggers
- **Supabase**: Uses `auth.uid()` in triggers
- **CockroachDB**: Uses standard PostgreSQL-compatible triggers
- **Impact**: The `handle_new_user()` function auto-creates profiles on signup

### Data Types
- **Supabase**: Uses `TEXT`, `TIMESTAMP WITH TIME ZONE`
- **CockroachDB**: Uses `STRING`, `TIMESTAMPTZ` (compatible aliases)
- **Impact**: No changes needed - types are compatible

### Cloud-Specific Considerations
- **SSL Required**: CockroachDB Cloud requires SSL connections (`sslmode=require`)
- **Connection String**: Use the connection string from CockroachDB Cloud Console
- **Network Latency**: Cloud connections may have higher latency than local databases
- **Backup**: CockroachDB Cloud provides automated backups

## Step 5: Update Environment Variables

Ensure your `.env` file has the correct CockroachDB Cloud connection:

```env
# CockroachDB Cloud Connection (IMPORTANT: include sslmode=require)
DATABASE_URL=postgresql://username:password@global-url.cockroachlabs.cloud:26257/dbname?sslmode=require

# JWT Secret (generate a new secure secret)
JWT_SECRET=your-secure-jwt-secret-here

# Email Service (if using)
EMAIL_SERVICE=your-email-service
EMAIL_API_KEY=your-email-api-key
```

**Important**: CockroachDB Cloud requires SSL connections. The connection string from the CockroachDB Cloud Console will automatically include `sslmode=require`. Make sure to copy the full connection string including this parameter.

## Step 6: Test the Migration

### Option A: Using CockroachDB Cloud Console (Web UI)

1. Log in to your CockroachDB Cloud Console
2. Navigate to your cluster
3. Click "SQL Console" 
4. Run the verification queries directly in the web interface

### Option B: Using psql (Command Line)

### 1. Verify Data Import

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
```

### 2. Test Authentication

Try logging in with an existing user account to verify:
- Password authentication works
- JWT tokens are generated correctly
- Profile data is accessible

### 3. Test Application Features

- Test profile updates
- Test taking exams and saving results
- Test viewing test history

## Troubleshooting

### CockroachDB Cloud Specific Issues

**Problem**: Connection refused or SSL errors
**Solution**: 
- Ensure your connection string includes `sslmode=require`
- Check that you're using the correct connection string from CockroachDB Cloud Console
- Verify your cluster is running and accessible

**Problem**: Import script can't connect to CockroachDB Cloud
**Solution**:
- Verify `DATABASE_URL` in `.env` matches the CockroachDB Cloud Console connection string exactly
- Check that your IP is allowed (CockroachDB Cloud allows all IPs by default)
- Ensure you're not behind a corporate firewall blocking PostgreSQL ports

### Import Script Issues

**Problem**: `relation "users" does not exist`
**Solution**: Ensure you ran the schema migrations first (001_init.sql, 002_email_auth.sql)

**Problem**: Password hashes not importing
**Solution**: Check that the CSV export includes the `encrypted_password` column from Supabase

### Authentication Issues

**Problem**: Users can't log in with existing passwords
**Solution**: Verify that `password_hash` column was imported correctly from Supabase's `encrypted_password`

**Problem**: JWT token errors
**Solution**: Ensure `JWT_SECRET` is set in `.env` and is the same length/complexity as before

### Data Issues

**Problem**: Missing profiles for some users
**Solution**: The trigger should auto-create profiles, but you can manually create them:

```sql
INSERT INTO profiles (id, full_name)
SELECT id, NULL
FROM users
WHERE id NOT IN (SELECT id FROM profiles);
```

## Rollback Plan

If you need to rollback to Supabase:

1. Keep your Supabase database running
2. Update `.env` to point back to Supabase
3. Switch DNS/load balancer back to Supabase
4. Any new data in CockroachDB will need to be manually exported/imported

## Post-Migration Cleanup

Once migration is verified:

1. **Monitor for 1-2 weeks**: Watch for any authentication or data issues
2. **Backup CockroachDB**: Create regular backups of your new database
3. **Deprecate Supabase**: After confirmation period, you can cancel Supabase
4. **Update documentation**: Update any team documentation with new architecture

## CockroachDB Cloud Benefits

Using CockroachDB Cloud provides several advantages over self-hosted:

- **Managed Service**: No need to manage database servers or updates
- **Automatic Backups**: Built-in backup and point-in-time recovery
- **Global Scalability**: Choose regions close to your users
- **High Availability**: Automatic replication and failover
- **Security**: Built-in encryption and compliance features
- **Monitoring**: Built-in metrics and dashboards

## Additional Notes

### Performance Optimizations

The migration includes these indexes for performance:
- `idx_users_email` on users.email
- `idx_profiles_id` on profiles.id
- `idx_test_results_user_id` on test_results.user_id
- `idx_test_results_completed_at` on test_results.completed_at

### Security

- Passwords are preserved using bcrypt hashes
- JWT tokens are used for session management
- Application-level authorization replaces database RLS
- Ensure your `JWT_SECRET` is strong and kept secure

### Scalability

CockroachDB provides:
- Horizontal scaling
- Automatic replication
- Geo-partitioning capabilities
- Better performance for distributed workloads

## Support

If you encounter issues:
1. Check CockroachDB logs
2. Verify database connection
3. Test SQL queries directly against CockroachDB
4. Review Express server logs for application errors