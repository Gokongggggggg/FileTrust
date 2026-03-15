const express = require('express');
const { checkURL } = require('../scanner/urlChecker');
const { canScan, recordScan } = require('../db/quota');

const router = express.Router();

router.post('/', async (req, res) => {
  const { url, email } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL tidak boleh kosong' });
  }

  // Basic URL validation
  let parsed;
  try {
    parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return res.status(400).json({ error: 'URL tidak valid' });
  }

  const targetUrl = parsed.href;

  try {
    // Check quota
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const identifier = email?.toLowerCase().trim() || ip;
    const quota = await canScan(identifier);

    if (!quota.allowed) {
      return res.status(429).json({
        error: 'Kuota scan habis. Upgrade untuk scan lebih banyak.',
        quota: { remaining: 0, plan: quota.plan },
      });
    }

    const result = await checkURL(targetUrl);

    // Record usage
    await recordScan(identifier, 'url');
    res.json({
      url: result.url,
      finalUrl: result.finalUrl,
      shortened: result.shortened,
      isSafe: !result.malicious,
      reason: result.reason,
      checkedAt: new Date().toISOString(),
      virusTotal: result.vtData,
      googleSafeBrowsing: { flagged: result.gsbFlagged },
    });
  } catch (err) {
    console.error('[CheckURL] Error:', err.message);
    res.status(500).json({ error: 'Gagal memeriksa URL. Coba lagi.' });
  }
});

module.exports = router;
