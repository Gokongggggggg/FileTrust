require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDB } = require('./db/cache');
const { cleanExpired } = require('./db/fileStore');
const uploadRouter = require('./api/upload');
const resultRouter = require('./api/result');
const checkUrlRouter = require('./api/checkUrl');

const app = express();
app.use(express.json());

// API routes
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'FileTrust' }));
app.use('/api/upload', uploadRouter);
app.use('/api/result', resultRouter);
app.use('/api/check-url', checkUrlRouter);

// Serve React frontend
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initDB();
  } catch (err) {
    console.warn('[DB] Could not connect:', err.message);
  }

  // Clean expired files every hour
  setInterval(cleanExpired, 60 * 60 * 1000);

  app.listen(PORT, () => console.log(`[FileTrust] Server running on port ${PORT}`));
}

start();
