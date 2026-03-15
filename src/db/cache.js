const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

async function initDB() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS scan_cache (
        file_hash TEXT PRIMARY KEY,
        result    JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_store (
        code       TEXT PRIMARY KEY,
        file_name  TEXT NOT NULL,
        file_data  TEXT NOT NULL,
        scan_result JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);
    console.log('[DB] tables ready');
  } finally {
    client.release();
  }
}

/**
 * Get cached scan result by file hash
 * @param {string} fileHash
 * @returns {object|null}
 */
async function getCachedResult(fileHash) {
  try {
    const res = await getPool().query('SELECT result FROM scan_cache WHERE file_hash = $1', [fileHash]);
    return res.rows[0]?.result || null;
  } catch {
    return null;
  }
}

/**
 * Store scan result in cache
 * @param {string} fileHash
 * @param {object} result
 */
async function setCachedResult(fileHash, result) {
  try {
    await getPool().query(
      'INSERT INTO scan_cache (file_hash, result) VALUES ($1, $2) ON CONFLICT (file_hash) DO UPDATE SET result = $2, created_at = NOW()',
      [fileHash, JSON.stringify(result)]
    );
  } catch {
    // Non-fatal — cache miss is acceptable
  }
}

module.exports = { getPool, initDB, getCachedResult, setCachedResult };
