// Vercel Serverless — GET /api/auth/check-rate
// 브루트포스 방어: IP 기반 로그인 시도 확인
// ⚠️ Serverless: cold start 시 리셋 (1차 방어: 클라이언트 localStorage)

const loginAttempts = new Map();
const BF_MAX_FAILURES = 10;
const BF_WINDOW_MS = 15 * 60 * 1000;

function getIP(req) {
  const xff = req.headers['x-forwarded-for'];
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const ip = getIP(req);
  const record = loginAttempts.get(ip);

  if (!record) return res.json({ allowed: true, remaining: BF_MAX_FAILURES });

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const retryAfterSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      allowed: false, remaining: 0, retryAfter: retryAfterSec,
      message: `Too many login attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.`,
    });
  }

  if (Date.now() - record.lastAttempt > BF_WINDOW_MS) {
    loginAttempts.delete(ip);
    return res.json({ allowed: true, remaining: BF_MAX_FAILURES });
  }

  const remaining = Math.max(0, BF_MAX_FAILURES - record.failures);
  return res.json({ allowed: remaining > 0, remaining });
}
