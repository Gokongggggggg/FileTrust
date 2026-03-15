const { getPool } = require('./cache');

const FREE_DAILY_LIMIT = 3;

/**
 * Get or create quota record for an identifier (IP or email)
 */
async function getQuota(identifier) {
  const pool = getPool();

  // Try to get existing
  let res = await pool.query('SELECT * FROM scan_quota WHERE identifier = $1', [identifier]);
  if (res.rows[0]) return res.rows[0];

  // Create new free-tier quota
  await pool.query(
    'INSERT INTO scan_quota (identifier, credits, plan) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [identifier, 0, 'free']
  );
  res = await pool.query('SELECT * FROM scan_quota WHERE identifier = $1', [identifier]);
  return res.rows[0];
}

/**
 * Check if user can scan (has credits or free daily limit not reached)
 */
async function canScan(identifier) {
  const quota = await getQuota(identifier);

  // Paid credits available
  if (quota.credits > 0) {
    return { allowed: true, reason: 'credits', remaining: quota.credits, plan: quota.plan };
  }

  // Unlimited plan
  if (quota.plan === 'unlimited') {
    return { allowed: true, reason: 'unlimited', remaining: -1, plan: 'unlimited' };
  }

  // Free tier — check daily usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await getPool().query(
    'SELECT COUNT(*) as count FROM scan_usage WHERE identifier = $1 AND created_at >= $2',
    [identifier, today.toISOString()]
  );

  const used = parseInt(usage.rows[0].count);
  const remaining = FREE_DAILY_LIMIT - used;

  if (remaining > 0) {
    return { allowed: true, reason: 'free', remaining, plan: 'free' };
  }

  return { allowed: false, reason: 'limit_reached', remaining: 0, plan: 'free' };
}

/**
 * Record a scan usage and deduct credit if applicable
 */
async function recordScan(identifier, scanType = 'file') {
  const pool = getPool();
  const quota = await getQuota(identifier);

  // Record usage
  await pool.query(
    'INSERT INTO scan_usage (identifier, scan_type) VALUES ($1, $2)',
    [identifier, scanType]
  );

  // Deduct credit if using paid credits (not free tier, not unlimited)
  if (quota.credits > 0 && quota.plan !== 'unlimited') {
    await pool.query(
      'UPDATE scan_quota SET credits = credits - 1, updated_at = NOW() WHERE identifier = $1 AND credits > 0',
      [identifier]
    );
  }
}

/**
 * Add credits to a user
 */
async function addCredits(identifier, amount, email) {
  const pool = getPool();
  await getQuota(identifier); // ensure exists

  await pool.query(
    `UPDATE scan_quota SET credits = credits + $2, email = COALESCE($3, email), updated_at = NOW() WHERE identifier = $1`,
    [identifier, amount, email]
  );
}

/**
 * Set user plan (e.g., 'unlimited')
 */
async function setPlan(identifier, plan, email) {
  const pool = getPool();
  await getQuota(identifier); // ensure exists

  await pool.query(
    `UPDATE scan_quota SET plan = $2, email = COALESCE($3, email), updated_at = NOW() WHERE identifier = $1`,
    [identifier, plan, email]
  );
}

/**
 * Get quota info for display
 */
async function getQuotaInfo(identifier) {
  const check = await canScan(identifier);
  const quota = await getQuota(identifier);

  return {
    plan: quota.plan,
    credits: quota.credits,
    allowed: check.allowed,
    remaining: check.remaining,
    reason: check.reason,
    email: quota.email,
    dailyLimit: FREE_DAILY_LIMIT,
  };
}

module.exports = { canScan, recordScan, addCredits, setPlan, getQuotaInfo, FREE_DAILY_LIMIT };
