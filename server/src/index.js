import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import testResultsRoutes from './routes/testResults.js';
import aiNotesRoutes from './routes/aiNotes.js';

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
app.use('/api/ai-notes', aiNotesRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start the server if this is not a serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => {
    console.log(`StatNexus API running on http://localhost:${PORT}`);
  });
}

// Export for Netlify Functions
export default app;
