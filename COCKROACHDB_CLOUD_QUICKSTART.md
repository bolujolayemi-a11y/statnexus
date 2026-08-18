# CockroachDB Cloud Quick Start Guide

This guide focuses specifically on using CockroachDB Cloud's web interface for your migration.

## Getting Started with CockroachDB Cloud

### 1. Create Your Cluster

1. Go to [CockroachDB Cloud Console](https://console.cockroachlabs.com/)
2. Sign up or log in
3. Click "Create Cluster"
4. Choose your plan:
   - **Free**: Good for development/testing
   - **Standard**: Production-ready with SLA
5. Select a region (choose one closest to your users)
6. Name your cluster (e.g., "statnexus-production")
7. Click "Create Cluster" and wait for provisioning (2-5 minutes)

### 2. Get Your Connection String

1. In your cluster dashboard, click "Connect"
2. Select "General" for the connection type
3. Choose your SQL client (Node.js uses PostgreSQL protocol)
4. Copy the connection string - it will look like:
   ```
   postgresql://username:password@global-url.cockroachlabs.cloud:26257/dbname?sslmode=require
   ```

### 3. Set Up Your Database

Using the CockroachDB Cloud Console SQL Editor:

1. Click "SQL Console" in your cluster
2. Run the following to create your database:

```sql
CREATE DATABASE statnexus;
```

3. Run the schema migrations by copying/pasting each file:
   - `server/migrations/001_init.sql`
   - `server/migrations/002_email_auth.sql` 
   - `server/migrations/003_migrate_from_supabase.sql`

### 4. Configure Your Application

Update your `.env` file:

```env
DATABASE_URL=postgresql://username:password@global-url.cockroachlabs.cloud:26257/statnexus?sslmode=require
JWT_SECRET=your-secure-jwt-secret
```

### 5. Import Your Data

1. Export data from Supabase using `server/scripts/export-from-supabase.sql`
2. Save CSV files to `server/import-data/`
3. Run the import script:
   ```bash
   node server/scripts/import-supabase.js
   ```

## Using the CockroachDB Cloud Console

### SQL Editor

- **Access**: Click "SQL Console" in your cluster
- **Features**: 
  - Run SQL queries directly
  - View query results
  - Export results as CSV
  - Save queries for later use
- **Tips**:
  - Use Ctrl+Enter to execute queries
  - Click on table names to autocomplete
  - Use the "Explain" button to analyze query performance

### Dashboard

- **Overview**: Cluster health, metrics, and activity
- **Metrics**: CPU, memory, disk usage, query performance
- **Logs**: Database activity and error logs
- **Backups**: Automated backup schedule and restoration

### Monitoring

CockroachDB Cloud provides built-in monitoring:

1. **Insights Tab**: Query performance analysis
2. **Metrics**: Real-time database metrics
3. **Logs**: Detailed logging of database operations
4. **Alerts**: Set up notifications for important events

## Common CockroachDB Cloud Operations

### View Tables

```sql
SHOW TABLES;
```

### Describe Table Structure

```sql
SHOW COLUMNS FROM users;
```

### Check Data Counts

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM test_results;
```

### Monitor Active Connections

```sql
SHOW CLUSTER SESSIONS;
```

### View Query Performance

```sql
-- In the SQL Editor, use the "Explain" button
-- Or run:
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

## Backup and Restore

CockroachDB Cloud provides automated backups:

### View Backups

1. Go to your cluster
2. Click "Backups" in the left sidebar
3. View scheduled backups and their status

### Manual Backup

```sql
-- In SQL Editor
BACKUP DATABASE statnexus TO 's3://your-bucket/path?AWS_ACCESS_KEY_ID=xxx&AWS_SECRET_ACCESS_KEY=yyy';
```

### Restore from Backup

```sql
RESTORE DATABASE statnexus FROM 's3://your-bucket/path?AWS_ACCESS_KEY_ID=xxx&AWS_SECRET_ACCESS_KEY=yyy';
```

## Security Best Practices

### 1. Network Security

- CockroachDB Cloud allows all IPs by default
- Consider using VPC peering for enhanced security
- Use SSL connections (required by default)

### 2. Authentication

- Never commit your connection string to git
- Use environment variables for credentials
- Rotate passwords regularly

### 3. Data Encryption

- CockroachDB Cloud encrypts data at rest
- SSL encrypts data in transit
- Consider application-level encryption for sensitive data

## Performance Optimization

### Indexes

Your migration includes these indexes:

```sql
-- View existing indexes
SHOW INDEXES FROM users;
SHOW INDEXES FROM profiles;
SHOW INDEXES FROM test_results;
```

### Query Optimization

Use the SQL Editor's "Explain" feature to analyze slow queries:

```sql
EXPLAIN ANALYZE 
SELECT * FROM test_results 
WHERE user_id = 'user-uuid' 
ORDER BY completed_at DESC;
```

## Scaling

### Vertical Scaling

1. Go to your cluster settings
2. Click "Edit Cluster"
3. Upgrade to a larger instance type

### Horizontal Scaling

CockroachDB Cloud automatically handles:
- Read replicas
- Load balancing
- Geographic distribution

## Cost Management

### Monitor Usage

- Check the "Billing" section regularly
- Monitor storage and query usage
- Set up billing alerts

### Optimize Costs

- Use appropriate instance sizes
- Clean up old test data
- Consider archiving historical data

## Troubleshooting Common Issues

### Connection Issues

**Problem**: Can't connect from application
**Solution**: 
- Verify connection string includes `sslmode=require`
- Check that your database name is correct
- Ensure credentials are valid

### Performance Issues

**Problem**: Slow queries
**Solution**:
- Use `EXPLAIN ANALYZE` to identify bottlenecks
- Check missing indexes
- Review query patterns

### Storage Issues

**Problem**: Running out of storage
**Solution**:
- Clean up old test results
- Archive historical data
- Upgrade storage plan

## Getting Help

- **Documentation**: [CockroachDB Cloud Docs](https://www.cockroachlabs.com/docs/cockroachcloud/)
- **Support**: Available through the CockroachDB Cloud Console
- **Community**: [CockroachDB Community Forum](https://www.cockroachlabs.com/community/)

## Migration Checklist

- [ ] Create CockroachDB Cloud cluster
- [ ] Get connection string
- [ ] Create database
- [ ] Run schema migrations
- [ ] Update `.env` with connection string
- [ ] Export data from Supabase
- [ ] Import data to CockroachDB
- [ ] Test authentication
- [ ] Test application features
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update DNS/load balancer (if applicable)