import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail, appUrl } from '../services/email.js';
import { createToken, tokenExpiry } from '../utils/tokens.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

async function sendVerificationEmail(user) {
  const token = createToken();
  const expires = tokenExpiry(48);

  await query(
    `UPDATE users
     SET verification_token = $1, verification_token_expires = $2
     WHERE id = $3`,
    [token, expires, user.id]
  );

  const verifyUrl = appUrl(`/?view=verify-email&token=${token}`);

  await sendEmail({
    to: user.email,
    subject: 'Verify your StatNexus account',
    text: `Verify your email: ${verifyUrl}`,
    html: `<p>Welcome to StatNexus!</p><p><a href="${verifyUrl}">Verify your email</a></p><p>This link expires in 48 hours.</p>`,
  });
}

router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const dbClient = await pool.connect();

  try {
    await dbClient.query('BEGIN');

    const userResult = await dbClient.query(
      `INSERT INTO users (email, password_hash, email_verified)
       VALUES ($1, $2, false)
       RETURNING id, email, created_at`,
      [email.toLowerCase().trim(), passwordHash]
    );

    const user = userResult.rows[0];

    await dbClient.query(
      `INSERT INTO profiles (id, full_name)
       VALUES ($1, $2)`,
      [user.id, full_name?.trim() || null]
    );

    await dbClient.query('COMMIT');

    try {
      await sendVerificationEmail(user);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
    }

    const token = signToken(user);

    return res.status(201).json({
      user: { id: user.id, email: user.email, email_verified: false },
      session: { access_token: token },
      message: 'Account created. Check your email to verify your address.',
    });
  } catch (err) {
    await dbClient.query('ROLLBACK');

    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to create account' });
  } finally {
    dbClient.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await query(
      'SELECT id, email, password_hash, email_verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email before signing in',
        email_verified: false,
      });
    }

    const token = signToken(user);

    return res.json({
      user: { id: user.id, email: user.email, email_verified: user.email_verified },
      session: { access_token: token },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to sign in' });
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    const result = await query(
      `UPDATE users
       SET email_verified = true,
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE verification_token = $1
         AND verification_token_expires > now()
       RETURNING id, email`,
      [token]
    );

    if (!result.rows[0]) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    return res.json({ message: 'Email verified successfully', email: result.rows[0].email });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

router.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, email_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.email_verified) {
      return res.json({ message: 'Email is already verified' });
    }

    await sendVerificationEmail(user);
    return res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (user) {
      const token = createToken();
      const expires = tokenExpiry(1);

      await query(
        `UPDATE users
         SET reset_token = $1, reset_token_expires = $2
         WHERE id = $3`,
        [token, expires, user.id]
      );

      const resetUrl = appUrl(`/?view=reset-password&token=${token}`);

      await sendEmail({
        to: user.email,
        subject: 'Reset your StatNexus password',
        text: `Reset your password: ${resetUrl}`,
        html: `<p>Reset your StatNexus password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 1 hour.</p>`,
      });
    }

    return res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const result = await query(
      `SELECT id FROM users
       WHERE reset_token = $1
         AND reset_token_expires > now()`,
      [token]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await query(
      `UPDATE users
       SET password_hash = $1,
           reset_token = NULL,
           reset_token_expires = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.email_verified, p.full_name, p.syllabus_focus, p.account_tier
       FROM users u
       JOIN profiles p ON p.id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: row.id,
        email: row.email,
        email_verified: row.email_verified,
        full_name: row.full_name,
        syllabus_focus: row.syllabus_focus,
        account_tier: row.account_tier,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.delete('/account', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);
    return res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
