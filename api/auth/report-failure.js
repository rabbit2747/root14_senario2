// Vercel Serverless — POST /api/auth/report-failure
// 로그인 실패 보고 → 카운트 증가 → 10회 초과 시 15분 잠금

const loginAttempts = new Map();
const BF_MAX_FAILURES = 10;
const BF_WINDOW_MS = 15 * 60 * 1000;
const BF_LOCKOUT_MS = 15 * 60 * 1000;

function getIP(req) {
  const xff = req.headers['x-forwarded-for'];
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const ip = getIP(req);
  const now = Date.now();
  let record = loginAttempts.get(ip);

  if (!record || (now - record.lastAttempt > BF_WINDOW_MS && now > (record.lockedUntil || 0))) {
    record = { failures: 0, lastAttempt: now, lockedUntil: 0 };
  }

  record.failures += 1;
  record.lastAttempt = now;

  if (record.failures >= BF_MAX_FAILURES) {
    record.lockedUntil = now + BF_LOCKOUT_MS;
    loginAttempts.set(ip, record);
    const retryAfterSec = Math.ceil(BF_LOCKOUT_MS / 1000);
    return res.status(429).json({
      locked: true, retryAfter: retryAfterSec,
      message: `Account locked for ${Math.ceil(retryAfterSec / 60)} minutes.`,
    });
  }

  loginAttempts.set(ip, record);
  return res.json({ locked: false, remaining: BF_MAX_FAILURES - record.failures });
}
