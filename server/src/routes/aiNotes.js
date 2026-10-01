import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { generateStudyNote } from '../services/ai/notesService.js';

const router = Router();

const MAX_TOPIC_LENGTH = 200;
const HISTORY_LIMIT = 50;

// Persist (or bump) a search for the given user. Never throws — a history
// failure must not break note generation.
async function recordSearch(userId, topic, note) {
  const normalized = topic.trim();

  try {
    const result = await query(
      `INSERT INTO ai_note_history (user_id, topic, note)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, topic) DO UPDATE
         SET search_count = ai_note_history.search_count + 1,
             last_searched_at = now(),
             note = COALESCE(EXCLUDED.note, ai_note_history.note)
       RETURNING id, topic, search_count, created_at, last_searched_at`,
      [userId, normalized, note ? JSON.stringify(note) : null]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error('Record AI note search error:', err.message);
    return null;
  }
}

router.post('/generate', requireAuth, async (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const normalizedTopic = topic.trim().slice(0, MAX_TOPIC_LENGTH);

  try {
    const note = await generateStudyNote(normalizedTopic);
    const historyEntry = await recordSearch(req.user.id, normalizedTopic, note);

    return res.json({
      ...note,
      history_id: historyEntry?.id || null,
      search_count: historyEntry?.search_count || 1,
    });
  } catch (err) {
    console.error('AI Notes generation error:', err);
    return res.status(500).json({ error: 'Failed to generate study note' });
  }
});

// List previously searched topics (newest search first)
router.get('/history', requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, HISTORY_LIMIT);

  try {
    const result = await query(
      `SELECT id, topic, search_count, created_at, last_searched_at,
              CASE WHEN note IS NULL THEN false ELSE true END AS has_note
       FROM ai_note_history
       WHERE user_id = $1
       ORDER BY last_searched_at DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Get AI note history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
});

// Fetch one saved note
router.get('/history/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, topic, note, search_count, created_at, last_searched_at
       FROM ai_note_history
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    const entry = result.rows[0];

    return res.json({
      ...(entry.note || {}),
      id: entry.id,
      topic: entry.topic,
      search_count: entry.search_count,
      generated_at: entry.note?.generated_at || entry.last_searched_at,
    });
  } catch (err) {
    console.error('Get AI note history entry error:', err);
    return res.status(500).json({ error: 'Failed to fetch history entry', details: err.message });
  }
});

// Delete a single history entry
router.delete('/history/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM ai_note_history WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    return res.json({ message: 'History entry deleted' });
  } catch (err) {
    console.error('Delete AI note history entry error:', err);
    return res.status(500).json({ error: 'Failed to delete history entry', details: err.message });
  }
});

// Clear the entire history
router.delete('/history', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM ai_note_history WHERE user_id = $1', [req.user.id]);
    return res.json({ message: 'History cleared' });
  } catch (err) {
    console.error('Clear AI note history error:', err);
    return res.status(500).json({ error: 'Failed to clear history', details: err.message });
  }
});

router.post('/classify', requireAuth, async (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const classification = await generateStudyNote(topic, true);
    return res.json({ classification: classification.type });
  } catch (err) {
    console.error('Topic classification error:', err);
    return res.status(500).json({ error: 'Failed to classify topic' });
  }
});

export default router;