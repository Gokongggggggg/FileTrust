const express = require('express');
const { checkURL } = require('../scanner/urlChecker');

const router = express.Router();

router.post('/', async (req, res) => {
  const { url } = req.body;
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
    const result = await checkURL(targetUrl);
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
