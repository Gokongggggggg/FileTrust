require('dotenv').config();
const express = require('express');
const { initDB } = require('./db/cache');
const webhookRouter = require('./bot/webhook');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'SafeSend' }));

app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initDB();
  } catch (err) {
    console.warn('[DB] Could not connect to database:', err.message, '— running without cache');
  }
  app.listen(PORT, () => console.log(`[SafeSend] Server running on port ${PORT}`));
}

start();
