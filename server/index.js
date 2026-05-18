require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { cleanupOldUploads } = require('./utils/fileHelpers');
const { preWarmWord, shutdownWord } = require('./utils/wordComHelper');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  exposedHeaders: ['X-Storage-Names', 'Content-Disposition'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Increase server timeout for Word COM conversions (2 minutes)
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// API Routes
const pdfRoutes = require('./routes/pdf.routes');
const aiRoutes  = require('./routes/ai.routes');
app.use('/api/pdf', pdfRoutes);
app.use('/api/ai',  aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Max 100MB combined.' });
  }

  if (err.message && err.message.includes('Only')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// Background cleanup scheduler (every 10 minutes)
cron.schedule('*/10 * * * *', () => {
  const removed = cleanupOldUploads();
  if (removed.length > 0) {
    console.log(`[Cleanup] Removed ${removed.length} expired uploads.`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Konvert API server running on http://localhost:${PORT}`);
  // Pre-warm Word COM so first conversion is fast
  preWarmWord();
});

// Graceful shutdown: quit background Word instance
process.on('SIGINT', () => { shutdownWord(); process.exit(0); });
process.on('SIGTERM', () => { shutdownWord(); process.exit(0); });
process.on('exit', () => { shutdownWord(); });
