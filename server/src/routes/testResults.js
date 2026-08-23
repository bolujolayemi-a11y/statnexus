import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const withQuestions = req.query.withQuestions === 'true';

  try {
    const fields = withQuestions
      ? 'id, exam_type, score, duration_minutes, completed_at, questions, user_answers'
      : 'score, duration_minutes';

    const result = await query(
      `SELECT ${fields}
       FROM test_results
       WHERE user_id = $1
       ${withQuestions ? 'AND questions IS NOT NULL' : ''}
       ORDER BY completed_at DESC`,
      [req.user.userId] // <--- Fixed: changed req.user.id to req.user.userId
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Get test results error:', err);
    return res.status(500).json({ error: 'Failed to fetch test results', details: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const {
    exam_type,
    score,
    questions_count,
    duration_minutes,
    user_answers,
    questions,
  } = req.body;

  if (!exam_type || score == null || !questions_count) {
    return res.status(400).json({ error: 'exam_type, score, and questions_count are required' });
  }

  try {
    const result = await query(
      `INSERT INTO test_results
        (user_id, exam_type, score, questions_count, duration_minutes, user_answers, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, exam_type, score, duration_minutes, completed_at`,
      [
        req.user.userId, // <--- Fixed: changed req.user.id to req.user.userId
        exam_type,
        score,
        questions_count,
        duration_minutes ?? 0,
        user_answers ? JSON.stringify(user_answers) : null,
        questions ? JSON.stringify(questions) : null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Insert test result error:', err);
    return res.status(500).json({ error: 'Failed to save test result', details: err.message });
  }
});

export default router;