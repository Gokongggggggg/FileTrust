const express = require('express');
const { handleMessage } = require('./messageHandler');

const router = express.Router();

// Webhook verification (Meta requirement)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    console.log('[Webhook] Verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Incoming messages
router.post('/', async (req, res) => {
  // Acknowledge immediately (Meta requires 200 within 20s)
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages?.length) return;

    for (const message of messages) {
      // Use group ID if from group, otherwise sender's number
      const groupId = value.metadata?.phone_number_id
        ? message.from
        : message.from;

      await handleMessage(message, groupId);
    }
  } catch (err) {
    console.error('[Webhook] Error processing message:', err.message);
  }
});

module.exports = router;
