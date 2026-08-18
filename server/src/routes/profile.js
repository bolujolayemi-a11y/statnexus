import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT full_name, syllabus_focus, account_tier, updated_at
       FROM profiles
       WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/', requireAuth, async (req, res) => {
  const { full_name, syllabus_focus, account_tier } = req.body;

  try {
    const result = await query(
      `UPDATE profiles
       SET full_name = COALESCE($1, full_name),
           syllabus_focus = COALESCE($2, syllabus_focus),
           account_tier = COALESCE($3, account_tier),
           updated_at = now()
       WHERE id = $4
       RETURNING full_name, syllabus_focus, account_tier, updated_at`,
      [full_name ?? null, syllabus_focus ?? null, account_tier ?? null, req.user.id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
