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

// Debug endpoint to check users - accessible via test-db for now
app.get('/api/test-db/users', async (_req, res) => {
  try {
    const currentPool = getPool();
    // First check what columns exist in users table
    const columns = await currentPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    // Then fetch users with existing columns
    const result = await currentPool.query('SELECT * FROM users LIMIT 5');
    
    res.json({ 
      status: 'ok', 
      columns: columns.rows,
      userCount: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    console.error('Users debug error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users', 
      details: error.message 
    });
  }
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('Getting database pool...');
    const currentPool = getPool();
    
    console.log('Querying database for user:', email);
    const result = await currentPool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    console.log('Query result:', { userCount: result.rows.length });

    if (result.rows.length === 0) {
      console.log('User not found in database');
      return res.status(401).json({ error: 'Invalid credentials', details: 'User not found' });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, hasPasswordHash: !!user.password_hash });
    
    console.log('Comparing password...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials', details: 'Incorrect password' });
    }

    // Get user's full name from profiles table
    let fullName = email.split('@')[0];
    try {
      const profileResult = await currentPool.query(
        'SELECT full_name FROM profiles WHERE id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0 && profileResult.rows[0].full_name) {
        fullName = profileResult.rows[0].full_name;
      }
    } catch (profileError) {
      console.log('Profile query failed, using email as name:', profileError.message);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log('JWT_SECRET missing');
      throw new Error('JWT_SECRET environment variable is not set');
    }

    console.log('Generating token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email);
    res.json({
      session: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          fullName: fullName
        }
      },
      user: {
        id: user.id,
        email: user.email,
        fullName: fullName
      }
    });
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.message,
      errorType: error.name
    });
  }
});

// Get current user endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const decoded = jwt.verify(token, jwtSecret);
    const currentPool = getPool();
    
    const result = await currentPool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    // Get full name from profiles
    let fullName = user.email.split('@')[0];
    try {
      const profileResult = await currentPool.query(
        'SELECT full_name FROM profiles WHERE id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0 && profileResult.rows[0].full_name) {
        fullName = profileResult.rows[0].full_name;
      }
    } catch (profileError) {
      console.log('Profile query failed:', profileError.message);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: fullName
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('=== REGISTER ATTEMPT ===');
    console.log('Request body:', req.body);
    
    const { email, password, fullName } = req.body;
    
    if (!email || !password || !fullName) {
      console.log('Missing fields:', { hasEmail: !!email, hasPassword: !!password, hasFullName: !!fullName });
      return res.status(400).json({ 
        error: 'All fields required',
        details: 'Email, password, and fullName are required',
        received: { email, hasPassword: !!password, fullName }
      });
    }

    const currentPool = getPool();
    
    console.log('Checking if user exists:', email);
    const existingUser = await currentPool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ error: 'User already exists', details: 'This email is already registered' });
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Creating user...');
    const result = await currentPool.query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES (gen_random_uuid(), $1, $2, NOW()) RETURNING id, email',
      [email, passwordHash]
    );

    console.log('Creating profile...');
    await currentPool.query(
      'INSERT INTO profiles (id, full_name, updated_at) VALUES ($1, $2, NOW())',
      [result.rows[0].id, fullName]
    );

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log('JWT_SECRET missing');
      throw new Error('JWT_SECRET environment variable is not set');
    }

    console.log('Generating token...');
    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('Registration successful');
    res.json({
      session: {
        access_token: token,
        user: {
          id: result.rows[0].id,
          email: result.rows[0].email,
          fullName: fullName
        }
      },
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: fullName
      }
    });
  } catch (error) {
    console.error('=== REGISTER ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message,
      errorType: error.name
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

export const handler = serverless(app);