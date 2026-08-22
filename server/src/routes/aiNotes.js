import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateStudyNote } from '../services/ai/notesService.js';

const router = Router();

router.post('/generate', requireAuth, async (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const note = await generateStudyNote(topic);
    return res.json(note);
  } catch (err) {
    console.error('AI Notes generation error:', err);
    return res.status(500).json({ error: 'Failed to generate study note' });
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