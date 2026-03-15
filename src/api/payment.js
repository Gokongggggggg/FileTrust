const express = require('express');
const axios = require('axios');
const { getPool } = require('../db/cache');
const { addCredits, setPlan } = require('../db/quota');

const router = express.Router();

const MAYAR_API = process.env.MAYAR_SANDBOX === 'true'
  ? 'https://api.mayar.club/hl/v1'
  : 'https://api.mayar.id/hl/v1';

const PLANS = {
  '10credits': { credits: 10, price: 15000, name: 'Paket 10 Scan' },
  '50credits': { credits: 50, price: 50000, name: 'Paket 50 Scan' },
  '100credits': { credits: 100, price: 85000, name: 'Paket 100 Scan' },
  'unlimited': { credits: 0, price: 99000, name: 'Unlimited Bulanan' },
};

/**
 * GET /api/payment/plans — list available plans
 */
router.get('/plans', (req, res) => {
  const plans = Object.entries(PLANS).map(([id, p]) => ({
    id,
    name: p.name,
    price: p.price,
    credits: p.credits,
    isUnlimited: id === 'unlimited',
  }));
  res.json({ plans });
});

/**
 * POST /api/payment/create — create a Mayar payment
 */
router.post('/create', async (req, res) => {
  const { planId, email, name } = req.body;

  if (!planId || !PLANS[planId]) {
    return res.status(400).json({ error: 'Plan tidak valid' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email diperlukan' });
  }

  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Mayar belum dikonfigurasi' });
  }

  const plan = PLANS[planId];
  const identifier = email.toLowerCase().trim();
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  try {
    // Create payment via Mayar API
    const mayarRes = await axios.post(`${MAYAR_API}/payment/create`, {
      name: name || email.split('@')[0],
      email: identifier,
      amount: plan.price,
      description: `${plan.name} — FileTrust`,
      redirectURL: `${baseUrl}/payment/success`,
      mobile: '',
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    const mayarData = mayarRes.data?.data;
    if (!mayarData?.link) {
      console.error('[Mayar] No link returned:', mayarRes.data);
      return res.status(500).json({ error: 'Gagal membuat pembayaran' });
    }

    // Store payment record
    await getPool().query(
      `INSERT INTO payments (mayar_trx_id, identifier, email, amount, credits, plan, status, mayar_link)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
      [mayarData.id, identifier, identifier, plan.price, plan.credits, planId, mayarData.link]
    );

    console.log('[Mayar] Payment created:', mayarData.id, 'for', identifier, 'plan:', planId);

    res.json({
      paymentUrl: mayarData.link,
      transactionId: mayarData.id,
      plan: plan.name,
      amount: plan.price,
    });
  } catch (err) {
    console.error('[Mayar] Create payment error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Gagal membuat pembayaran. Coba lagi.' });
  }
});

/**
 * POST /api/webhook/mayar — handle Mayar webhook events
 */
router.post('/webhook', async (req, res) => {
  const { event, data } = req.body;
  console.log('[Mayar Webhook] Event:', JSON.stringify(event), 'Data ID:', data?.id);

  // Only process payment.received
  if (event?.received !== 'payment.received') {
    return res.json({ received: true });
  }

  try {
    const pool = getPool();

    // Find payment by Mayar transaction ID
    const payment = await pool.query(
      'SELECT * FROM payments WHERE mayar_trx_id = $1',
      [data.id]
    );

    if (payment.rows.length === 0) {
      console.warn('[Mayar Webhook] Payment not found for:', data.id);
      return res.json({ received: true });
    }

    const record = payment.rows[0];
    if (record.status === 'paid') {
      console.log('[Mayar Webhook] Already processed:', data.id);
      return res.json({ received: true });
    }

    // Mark as paid
    await pool.query(
      'UPDATE payments SET status = $1, paid_at = NOW() WHERE mayar_trx_id = $2',
      ['paid', data.id]
    );

    // Add credits or set plan
    const identifier = record.identifier;
    if (record.plan === 'unlimited') {
      await setPlan(identifier, 'unlimited', record.email);
      console.log('[Mayar Webhook] Set unlimited plan for:', identifier);
    } else {
      await addCredits(identifier, record.credits, record.email);
      console.log('[Mayar Webhook] Added', record.credits, 'credits for:', identifier);
    }

    res.json({ received: true, processed: true });
  } catch (err) {
    console.error('[Mayar Webhook] Error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
