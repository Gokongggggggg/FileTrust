const express = require('express');
const crypto = require('crypto');
const { getPool } = require('../db/cache');

const router = express.Router();

// Simple JWT using HMAC-SHA256 (no external dependency)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function createToken(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600 }));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Auth middleware — attaches req.user if valid token present
 * Does NOT block requests — unauthenticated users still pass through
 */
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const payload = verifyToken(auth.slice(7));
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

/**
 * POST /api/auth/demo — login as demo tester account (unlimited quota)
 */
router.post('/demo', async (req, res) => {
  try {
    const pool = getPool();

    // Find demo user
    const result = await pool.query("SELECT * FROM users WHERE email = 'demo@filetrust.id'");
    if (!result.rows[0]) {
      return res.status(500).json({ error: 'Demo account not found' });
    }

    const u = result.rows[0];

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [u.id]);

    const token = createToken({
      userId: u.id,
      email: u.email,
      name: u.name,
      is_tester: u.is_tester,
    });

    res.json({
      token,
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        is_tester: u.is_tester,
      },
    });
  } catch (err) {
    console.error('[Auth] Demo login error:', err.message);
    res.status(500).json({ error: 'Login gagal' });
  }
});

/**
 * GET /api/auth/me — get current user info from JWT
 */
router.get('/me', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const pool = getPool();
    const result = await pool.query('SELECT id, email, name, is_tester, created_at FROM users WHERE id = $1', [req.user.userId]);
    if (!result.rows[0]) return res.status(401).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Auth] Me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.authMiddleware = authMiddleware;
router.verifyToken = verifyToken;
module.exports = router;
