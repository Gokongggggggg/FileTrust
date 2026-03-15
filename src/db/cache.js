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
    await client.query(`
      CREATE TABLE IF NOT EXISTS scan_quota (
        identifier TEXT PRIMARY KEY,
        credits    INT NOT NULL DEFAULT 3,
        plan       TEXT NOT NULL DEFAULT 'free',
        email      TEXT,
        mayar_customer_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS scan_usage (
        id         SERIAL PRIMARY KEY,
        identifier TEXT NOT NULL,
        scan_type  TEXT NOT NULL DEFAULT 'file',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id              SERIAL PRIMARY KEY,
        mayar_trx_id    TEXT UNIQUE,
        identifier      TEXT NOT NULL,
        email           TEXT,
        amount          INT NOT NULL,
        credits         INT NOT NULL,
        plan            TEXT NOT NULL DEFAULT 'credits',
        status          TEXT NOT NULL DEFAULT 'pending',
        mayar_link      TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        paid_at         TIMESTAMPTZ
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        name        TEXT,
        is_tester   BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        last_login  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed demo account (unlimited quota, no scan limits)
    const demo = await client.query("SELECT id FROM users WHERE email = 'demo@filetrust.id'");
    if (demo.rows.length === 0) {
      await client.query(
        `INSERT INTO users (email, name, is_tester) VALUES ('demo@filetrust.id', 'Demo Tester', TRUE) ON CONFLICT DO NOTHING`
      );
      await client.query(
        `INSERT INTO scan_quota (identifier, credits, plan) VALUES ('demo@filetrust.id', 0, 'unlimited') ON CONFLICT DO NOTHING`
      );
      console.log('[DB] Demo account seeded: demo@filetrust.id (unlimited)');
    }

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
