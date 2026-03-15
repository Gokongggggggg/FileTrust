const { getPool } = require('./cache');
const crypto = require('crypto');

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(4)}-${part(4)}`;
}

async function storeFile(fileName, fileBuffer, scanResult) {
  const code = generateCode();
  const fileData = fileBuffer.toString('base64');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await getPool().query(
    `INSERT INTO file_store (code, file_name, file_data, scan_result, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [code, fileName, fileData, JSON.stringify(scanResult), expiresAt]
  );
  return code;
}

async function getFile(code) {
  const res = await getPool().query(
    `SELECT * FROM file_store WHERE code = $1 AND expires_at > NOW()`,
    [code.toUpperCase()]
  );
  return res.rows[0] || null;
}

async function cleanExpired() {
  await getPool().query(`DELETE FROM file_store WHERE expires_at < NOW()`);
}

module.exports = { storeFile, getFile, cleanExpired };
