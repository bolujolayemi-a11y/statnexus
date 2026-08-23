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
    // Use generic SELECT to handle any schema
    const result = await currentPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('Query result:', { userCount: result.rows.length });

    if (result.rows.length === 0) {
      console.log('User not found in database');
      return res.status(401).json({ error: 'Invalid credentials', details: 'User not found' });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, hasPasswordHash: !!user.password_hash, userKeys: Object.keys(user) });
    
    // Handle different column names
    const passwordHash = user.password_hash || user.password_hash || user.password;
    if (!passwordHash) {
      console.log('No password hash found in user record');
      return res.status(500).json({ error: 'Database schema error', details: 'No password field found' });
    }
    
    console.log('Comparing password...');
    const isValidPassword = await bcrypt.compare(password, passwordHash);
    console.log('Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials', details: 'Incorrect password' });
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
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name || user.fullname || user.name || email.split('@')[0]
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
      'INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING id, email, full_name',
      [email, passwordHash, fullName]
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
      token,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name
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