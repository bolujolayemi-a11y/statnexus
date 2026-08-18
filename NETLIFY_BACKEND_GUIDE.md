# Backend Deployment Options for Netlify

## Current Setup Analysis

Your current architecture:
- **Frontend**: Vite + React (deployed on Netlify)
- **Backend**: Express.js (currently on external service like Render)
- **Database**: Migrating from Supabase to CockroachDB Cloud

## Netlify Backend Options

### Option 1: Netlify Functions with Express Adapter (Recommended for Full Netlify)

Netlify can run Express.js using the `@netlify/express` adapter, but it requires some configuration.

**Pros:**
- Everything on Netlify (single platform)
- No separate backend hosting costs
- Built-in CDN and edge functions

**Cons:**
- Requires code adaptation
- Limited execution time (10-60 seconds)
- Cold starts can add latency
- Database connections need special handling

### Option 2: Keep External Backend Hosting (Simplest)

Continue hosting your Express backend on a service like Render, Railway, or Fly.io.

**Pros:**
- No code changes needed
- Better for long-running processes
- Existing setup works
- More consistent performance

**Cons:**
- Separate hosting costs
- Two platforms to manage
- Not as integrated with Netlify

### Option 3: Netlify Functions (Rewrite as Serverless Functions)

Rewrite your Express routes as individual Netlify Functions.

**Pros:**
- Native Netlify integration
- Best performance
- Edge capabilities
- Cost-effective

**Cons:**
- Requires significant code rewrite
- Need to handle state/connections differently
- Learning curve for serverless patterns

## Recommendation: Option 2 (Keep External Backend)

For your use case, I recommend **Option 2** - keep your Express backend on a service like Render or Railway. Here's why:

1. **Database Connections**: CockroachDB Cloud connections work better with long-running servers
2. **No Code Changes**: Your existing Express setup works perfectly
3. **Performance**: Consistent response times without cold starts
4. **Simplicity**: Just update the DATABASE_URL environment variable

## Setup for Option 2

### 1. Choose a Backend Hosting Service

**Render** (if you're already using it):
- Free tier available
- Easy deployment
- Good for Express apps

**Railway**:
- Simple setup
- Good Postgres/CockroachDB support
- Reasonable pricing

**Fly.io**:
- Global deployment
- Good performance
- Docker-based

### 2. Deploy Your Express Backend

Update your backend for the new database:

```bash
# In your backend directory
cd server

# Update .env with CockroachDB Cloud connection
DATABASE_URL=postgresql://user:password@global-url.cockroachlabs.cloud:26257/statnexus?sslmode=require
JWT_SECRET=your-jwt-secret
EMAIL_SERVICE=your-email-service
EMAIL_API_KEY=your-email-api-key
CLIENT_ORIGIN=https://your-frontend.netlify.app
```

### 3. Update Frontend Environment

Update your frontend to point to the new backend URL:

```env
# .env.production
VITE_API_URL=https://your-backend.onrender.com/api
```

### 4. Update Netlify Configuration

Your `netlify.toml` is already set up correctly for the frontend:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Alternative: Option 1 (Netlify Functions with Express)

If you prefer everything on Netlify, here's how to adapt your Express app:

### 1. Install Required Packages

```bash
npm install @netlify/express serverless-http
```

### 2. Modify Your Express App

Update `server/src/index.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import testResultsRoutes from './routes/testResults.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(',').map((o) => o.trim()) || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/test-results', testResultsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`StatNexus API running on http://localhost:${PORT}`);
  });
}

// Export for Netlify Functions
export const handler = serverless(app);
```

### 3. Create Netlify Function Structure

```
netlify/
└── functions/
    └── api/
        └── index.js  # Your Express app
```

Move your Express app to `netlify/functions/api/index.js` and update imports accordingly.

### 4. Update Netlify Configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5. Handle Database Connections

For serverless functions, you need to manage database connections carefully:

```javascript
// server/src/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function query(text, params) {
  const currentPool = getPool();
  const client = await currentPool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
```

## CockroachDB Cloud Connection Issues

**Important**: CockroachDB Cloud connections can be challenging with serverless functions due to:

1. **Connection Limits**: Too many connections from serverless functions
2. **Cold Starts**: New connections on each function invocation
3. **Latency**: Connection establishment time

**Solutions:**
- Use connection pooling (like PgBouncer)
- Limit concurrent connections
- Use connection caching
- Consider external backend hosting for better connection management

## My Final Recommendation

**Go with Option 2 (External Backend Hosting)** because:

1. **CockroachDB Cloud Works Better**: Long-running servers handle database connections more efficiently
2. **No Code Changes**: Your current Express setup works perfectly
3. **Better Performance**: No cold starts or connection limitations
4. **Simpler Migration**: Just update DATABASE_URL and redeploy
5. **Cost Effective**: Free tiers available on Render/Railway

## Migration Steps

1. **Keep Netlify for frontend** (no changes needed)
2. **Migrate backend to CockroachDB**:
   - Update DATABASE_URL in backend .env
   - Run database migrations
   - Import your data
3. **Redeploy backend** to Render/Railway
4. **Update frontend** to point to new backend URL
5. **Test the complete flow**

This approach gives you the best of both worlds: Netlify's excellent frontend hosting with a robust backend service that handles CockroachDB connections properly.