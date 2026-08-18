# Full-Stack Netlify Deployment Guide

This guide covers deploying your StatNexus application with both frontend and backend on Netlify, using CockroachDB Cloud as the database.

## Architecture Overview

- **Frontend**: React + Vite (Netlify Sites)
- **Backend**: Express.js (Netlify Functions)
- **Database**: CockroachDB Cloud
- **All services**: Hosted on Netlify

## Prerequisites

1. Netlify account
2. CockroachDB Cloud account and cluster
3. Git repository with your code
4. Completed database schema migration
5. Imported data from Supabase

## Deployment Steps

### 1. Complete Database Setup

#### A. Run Schema Migrations

1. Log in to CockroachDB Cloud Console
2. Navigate to your cluster
3. Click "SQL Console"
4. Run these migration scripts in order:

```sql
-- Create base schema
-- Paste content from server/migrations/001_init.sql

-- Add email auth fields
-- Paste content from server/migrations/002_email_auth.sql

-- Add Supabase migration features
-- Paste content from server/migrations/003_migrate_from_supabase.sql
```

#### B. Import Your Data

1. Export data from Supabase using the SQL format (recommended)
2. Import to CockroachDB Cloud using the SQL Editor:

```sql
-- Import profiles
-- Paste content from server/import-data/profiles.sql

-- Import test results (may need to run in parts)
-- Paste content from server/import-data/test_results.sql
-- Then test_results_part2.sql, etc.
```

#### C. Get Connection String

1. In CockroachDB Cloud Console, go to "Connect"
2. Copy the connection string (it will include `sslmode=require`)
3. Format: `postgresql://user:password@global-url.cockroachlabs.cloud:26257/dbname?sslmode=require`

### 2. Configure Netlify Environment Variables

#### A. In Netlify Dashboard

1. Go to your Netlify site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add these variables:

```
DATABASE_URL=postgresql://user:password@global-url.cockroachlabs.cloud:26257/statnexus?sslmode=require
JWT_SECRET=your-secure-jwt-secret-here
CLIENT_ORIGIN=https://your-frontend.netlify.app
EMAIL_SERVICE=your-email-service
EMAIL_API_KEY=your-email-api-key
```

#### B. Generate JWT Secret

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy to Netlify

#### Option A: Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Netlify, click "Add new site" → "Import an existing project"
3. Connect your Git provider
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

#### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### 4. Verify Deployment

#### A. Check Frontend

1. Visit your Netlify site URL
2. Check that the React app loads
3. Try navigating through the application

#### B. Check Backend

1. Test the health endpoint:
   ```
   https://your-site.netlify.app/api/health
   ```
2. Should return: `{"status":"ok"}`

#### C. Test Authentication

1. Try to log in with an existing user
2. Check browser console for any errors
3. Verify JWT token is stored in localStorage

### 5. Monitor and Debug

#### A. View Function Logs

1. In Netlify dashboard, go to "Functions"
2. Click on your function (api)
3. View real-time logs and execution times

#### B. Check Database Connection

If you see database connection errors:

1. Verify `DATABASE_URL` is correct in Netlify environment variables
2. Check CockroachDB Cloud cluster is running
3. Ensure SSL is properly configured (`sslmode=require`)
4. Check CockroachDB Cloud logs for connection attempts

## Troubleshooting

### Common Issues

#### 1. Function Timeout

**Problem**: Netlify functions timeout after 10-60 seconds
**Solution**: 
- Optimize database queries
- Use connection pooling
- Consider splitting long operations

#### 2. Database Connection Errors

**Problem**: "Connection refused" or SSL errors
**Solution**:
- Verify `DATABASE_URL` includes `sslmode=require`
- Check CockroachDB Cloud cluster status
- Ensure credentials are correct
- Check network connectivity

#### 3. Cold Start Latency

**Problem**: First request after inactivity is slow
**Solution**:
- This is normal for serverless functions
- Subsequent requests will be faster
- Consider keeping functions warm with scheduled calls

#### 4. Environment Variables Not Loading

**Problem**: Functions can't access environment variables
**Solution**:
- Ensure variables are set in Netlify dashboard
- Check variable names match exactly
- Redeploy after adding variables
- Use `process.env.VARIABLE_NAME` in code

#### 5. CORS Issues

**Problem**: Frontend can't connect to backend
**Solution**:
- Ensure `CLIENT_ORIGIN` includes your Netlify domain
- Check CORS configuration in Express app
- Verify API URL in frontend is `/api` (relative path)

## Performance Optimization

### 1. Database Connection Pooling

Your serverless-optimized connection pool is already configured:

```javascript
max: 1, // Limit connections for serverless
idleTimeoutMillis: 30000, // Close idle connections after 30s
connectionTimeoutMillis: 10000, // Timeout after 10s
```

### 2. Function Caching

Netlify automatically caches function responses. Configure cache headers:

```javascript
// In your Express routes
app.get('/api/profile', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  // ... rest of your route
});
```

### 3. Bundle Size Optimization

Netlify automatically bundles your functions. To optimize:

- Keep dependencies minimal
- Use tree-shaking
- Avoid large libraries in function code

## Cost Considerations

### Netlify Functions Pricing

- **Free tier**: 125k function invocations/month
- **Pro tier**: $19/month for 1M invocations
- Monitor usage in Netlify dashboard

### CockroachDB Cloud Pricing

- **Free tier**: $0 for basic usage
- **Standard tier**: $36/month for production
- Monitor storage and request usage

## Security Best Practices

### 1. Environment Variables

- Never commit secrets to Git
- Use Netlify environment variables
- Rotate secrets regularly
- Use strong JWT secrets

### 2. Database Security

- Use SSL connections (enforced by CockroachDB Cloud)
- Limit database user permissions
- Regular backups (CockroachDB Cloud handles this)
- Monitor for unusual activity

### 3. API Security

- Your authentication middleware is already configured
- Rate limiting can be added if needed
- Input validation on all endpoints
- HTTPS only (Netlify provides this)

## Monitoring and Maintenance

### 1. Set Up Monitoring

- **Netlify Analytics**: Built-in site analytics
- **Function Logs**: Real-time function execution logs
- **CockroachDB Console**: Database performance metrics

### 2. Regular Tasks

- Monitor function execution times
- Check database connection pool usage
- Review error logs
- Update dependencies regularly
- Test backup and restore procedures

## Scaling Considerations

### When to Scale Up

- Function execution time increases
- Database query performance degrades
- User base grows significantly
- Error rates increase

### Scaling Options

1. **Netlify**: Upgrade to Pro tier for more invocations
2. **CockroachDB**: Upgrade to larger cluster
3. **Architecture**: Consider dedicated backend if serverless limits are hit

## Rollback Plan

If deployment fails:

1. **Netlify**: Automatic rollbacks available in deploy history
2. **Database**: Keep backups of previous Supabase data
3. **Code**: Git allows easy rollback to previous commits

```bash
# Rollback to previous commit
git revert HEAD
git push
```

## Next Steps

1. **Deploy**: Follow the deployment steps above
2. **Test**: Thoroughly test all functionality
3. **Monitor**: Set up monitoring and alerts
4. **Optimize**: Performance tune based on real usage
5. **Scale**: Upgrade plans as needed

## Support Resources

- **Netlify Docs**: https://docs.netlify.com/
- **CockroachDB Cloud Docs**: https://www.cockroachlabs.com/docs/cockroachcloud/
- **Express.js Docs**: https://expressjs.com/
- **Serverless-HTTP**: https://github.com/dougmoscrop/serverless-http

Congratulations! You now have a full-stack application running entirely on Netlify with CockroachDB Cloud as your database.