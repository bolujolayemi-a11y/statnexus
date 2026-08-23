import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Groq from 'groq-sdk';

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'JWT_SECRET not configured' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const currentPool = getPool();
    
    const result = await currentPool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [req.user.userId]
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

// Profile endpoints
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const currentPool = getPool();
    
    const result = await currentPool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    // Get profile data
    let profileData = { full_name: user.email.split('@')[0], account_tier: 'STANDARD' };
    try {
      const profileResult = await currentPool.query(
        'SELECT full_name, account_tier FROM profiles WHERE id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        profileData = {
          full_name: profileResult.rows[0].full_name || user.email.split('@')[0],
          account_tier: profileResult.rows[0].account_tier || 'STANDARD'
        };
      }
    } catch (profileError) {
      console.log('Profile query failed:', profileError.message);
    }

    res.json(profileData);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, account_tier } = req.body;
    const currentPool = getPool();
    
    await currentPool.query(
      'UPDATE profiles SET full_name = $1, account_tier = $2, updated_at = NOW() WHERE id = $3',
      [full_name, account_tier, req.user.userId]
    );

    res.json({ full_name, account_tier });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Test results endpoints
app.get('/api/test-results', authenticateToken, async (req, res) => {
  try {
    const currentPool = getPool();
    
    const result = await currentPool.query(
      'SELECT id, user_id, score, duration_minutes, created_at FROM test_results WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Test results error:', error);
    res.status(500).json({ error: 'Failed to fetch test results', details: error.message });
  }
});

app.post('/api/test-results', authenticateToken, async (req, res) => {
  try {
    const { score, duration_minutes, exam_type, questions, user_answers } = req.body;
    const currentPool = getPool();
    
    const result = await currentPool.query(
      'INSERT INTO test_results (id, user_id, score, duration_minutes, exam_type, questions, user_answers, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [req.user.userId, score, duration_minutes, exam_type, JSON.stringify(questions), JSON.stringify(user_answers)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Test result creation error:', error);
    res.status(500).json({ error: 'Failed to create test result', details: error.message });
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

// AI Notes endpoints
const NOTE_TEMPLATES = {
  drug: {
    sections: ['drug_class', 'mechanism', 'indications', 'contraindications', 'routes', 'dosage', 'side_effects', 'toxicity_signs', 'antidote', 'nursing_responsibilities', 'golden_point'],
    icon: '💊'
  },
  organ: {
    sections: ['location', 'anatomy', 'functions', 'blood_supply', 'innervation', 'physiology', 'clinical_relevance', 'common_disorders', 'golden_point'],
    icon: '🫀'
  },
  instrument: {
    sections: ['what_it_is', 'types', 'parts', 'indications', 'contraindications', 'equipment', 'procedure', 'precautions', 'complications', 'nursing_responsibilities', 'golden_point'],
    icon: '🩺'
  },
  disease: {
    sections: ['definition', 'causative_organism', 'transmission', 'risk_factors', 'pathophysiology', 'signs_symptoms', 'investigations', 'treatment', 'complications', 'prevention', 'nursing_management', 'golden_point'],
    icon: '🦠'
  },
  procedure: {
    sections: ['definition', 'indications', 'preparation', 'equipment', 'procedure_steps', 'post_procedure_care', 'complications', 'documentation', 'nursing_responsibilities', 'golden_point'],
    icon: '💉'
  },
  lab_test: {
    sections: ['definition', 'purpose', 'normal_values', 'abnormal_findings', 'clinical_significance', 'nursing_implications', 'patient_preparation', 'golden_point'],
    icon: '🧪'
  },
  emergency: {
    sections: ['definition', 'recognition', 'immediate_actions', 'secondary_assessment', 'treatment', 'medications', 'monitoring', 'documentation', 'golden_point'],
    icon: '🚑'
  },
  nursing_concept: {
    sections: ['definition', 'importance', 'principles', 'application', 'assessment', 'interventions', 'evaluation', 'golden_point'],
    icon: '📋'
  }
};

async function classifyTopic(topic) {
  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are a medical classification expert. Classify the given nursing/medical topic into one of these categories: drug, organ, instrument, disease, procedure, lab_test, emergency, nursing_concept. Return ONLY the category name as a single word.`
        },
        {
          role: 'user',
          content: topic
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const classification = response.choices[0].message.content.toLowerCase().trim();
    return { type: classification, template: NOTE_TEMPLATES[classification] || NOTE_TEMPLATES.nursing_concept };
  } catch (error) {
    console.error('Classification error:', error);
    return { type: 'nursing_concept', template: NOTE_TEMPLATES.nursing_concept };
  }
}

async function generateStructuredNote(topic, classification) {
  const template = classification.template;
  const sections = template.sections.join(', ');

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `You are a nursing education expert. Generate a comprehensive study note for the topic: "${topic}". 
        
        The note should be a JSON object with this exact structure:
        {
          "title": "Topic Title (uppercase)",
          "type": "${classification.type}",
          "icon": "${template.icon}",
          "sections": [
            {
              "title": "Section Title (title case)",
              "content": ["Detailed content as bullet points", "More details", "Key points"]
            }
          ],
          "golden_point": "One memorable exam tip or clinical pearl"
        }

        Sections to include: ${sections}

        Keep content concise, exam-focused, and clinically accurate. Each section should have 3-5 bullet points. Return ONLY valid JSON.`
      },
      {
        role: 'user',
        content: topic
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

app.post('/api/ai-notes/generate', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const classification = await classifyTopic(topic);
    const note = await generateStructuredNote(topic, classification);
    
    res.json({
      ...note,
      generated_at: new Date().toISOString(),
      topic
    });
  } catch (err) {
    console.error('AI Notes generation error:', err);
    res.status(500).json({ error: 'Failed to generate study note', details: err.message });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

export const handler = serverless(app);