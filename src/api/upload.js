const express = require('express');
const multer = require('multer');
const { scanPDF } = require('../scanner');
const { storeFile } = require('../db/fileStore');

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

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' });

  try {
    const result = await scanPDF(req.file.buffer, req.file.originalname);
    const code = await storeFile(req.file.originalname, req.file.buffer, result);
    res.json({ code, result });
  } catch (err) {
    console.error('[Upload] Error:', err.message);
    res.status(500).json({ error: 'Gagal memproses file. Coba lagi.' });
  }
});

module.exports = router;
