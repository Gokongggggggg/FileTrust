const express = require('express');
const multer = require('multer');
const { scanPDF } = require('../scanner');
const { storeFile } = require('../db/fileStore');
const { canScan, recordScan } = require('../db/quota');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF yang diizinkan'));
    }
  },
});

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Upload] Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' });

  try {
    // Check quota
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const email = req.body.email?.toLowerCase().trim();
    const identifier = email || ip;
    const quota = await canScan(identifier);

    if (!quota.allowed) {
      return res.status(429).json({
        error: 'Kuota scan habis. Upgrade untuk scan lebih banyak.',
        quota: { remaining: 0, plan: quota.plan },
      });
    }

    console.log('[Upload] Scanning file:', req.file.originalname, 'size:', req.file.size);
    const result = await scanPDF(req.file.buffer, req.file.originalname);
    console.log('[Upload] Scan complete, isSafe:', result.isSafe);

    // Only store file and generate code if file is safe
    // Record scan usage
    await recordScan(identifier, 'file');

    if (result.isSafe) {
      const code = await storeFile(req.file.originalname, req.file.buffer, result);
      console.log('[Upload] Stored with code:', code);
      const updatedQuota = await canScan(identifier);
      res.json({ code, result, quota: { remaining: updatedQuota.remaining, plan: updatedQuota.plan } });
    } else {
      console.log('[Upload] File not safe — not storing');
      const updatedQuota = await canScan(identifier);
      res.json({ code: null, result, quota: { remaining: updatedQuota.remaining, plan: updatedQuota.plan } });
    }
  } catch (err) {
    console.error('[Upload] Error:', err.message, err.stack);
    res.status(500).json({ error: 'Gagal memproses file. Coba lagi.' });
  }
});

module.exports = router;
