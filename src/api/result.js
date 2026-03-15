const express = require('express');
const { getFile } = require('../db/fileStore');

const router = express.Router();

router.get('/:code', async (req, res) => {
  const file = await getFile(req.params.code);
  if (!file) return res.status(404).json({ error: 'Kode tidak ditemukan atau sudah kedaluwarsa' });

  res.json({
    code: file.code,
    fileName: file.file_name,
    scanResult: file.scan_result,
    expiresAt: file.expires_at,
  });
});

router.get('/:code/download', async (req, res) => {
  const file = await getFile(req.params.code);
  if (!file) return res.status(404).json({ error: 'Kode tidak ditemukan atau sudah kedaluwarsa' });

  if (!file.scan_result.isSafe) {
    return res.status(403).json({ error: 'File ini terdeteksi berbahaya dan tidak bisa didownload' });
  }

  const buffer = Buffer.from(file.file_data, 'base64');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
  res.send(buffer);
});

module.exports = router;
