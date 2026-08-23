import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Database connection
let pool;
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });
  }
  return pool;
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test the database connection
app.get('/api/test-db', async (_req, res) => {
  try {
    const currentPool = getPool();
    const result = await currentPool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now, message: 'Database connection successful' });
  } catch (error) {
    console.error('DB test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message,
      envSet: !!process.env.DATABASE_URL
    });
  }
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const currentPool = getPool();
    const result = await currentPool.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.message 
    });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register attempt:', { email: req.body.email, fullName: req.body.fullName });
    
    const { email, password, fullName } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const currentPool = getPool();
    
    // Check if user exists
    const existingUser = await currentPool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await currentPool.query(
      'INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING id, email, full_name',
      [email, passwordHash, fullName]
    );

    // Create profile
    await currentPool.query(
      'INSERT INTO profiles (id, full_name, updated_at) VALUES ($1, $2, NOW())',
      [result.rows[0].id, fullName]
    );

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message 
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

export const handler = serverless(app);