const express = require('express');
const { getQuotaInfo } = require('../db/quota');

const router = express.Router();

/**
 * GET /api/quota — get scan quota for current user (by IP or email)
 */
router.get('/', async (req, res) => {
  const email = req.query.email?.toLowerCase().trim();
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const identifier = email || ip;

  try {
    const info = await getQuotaInfo(identifier);
    res.json(info);
  } catch (err) {
    console.error('[Quota] Error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil info kuota' });
  }
});

module.exports = router;
