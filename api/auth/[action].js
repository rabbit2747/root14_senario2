// Vercel Serverless — /api/auth/:action
// 브루트포스 방어: check-rate / report-failure / report-success
// ⚠️ Serverless: 같은 인스턴스 내에서만 상태 유지 (cold start 시 리셋)
//    1차 방어: 클라이언트 localStorage (Login.jsx), 2차 방어: 이 서버 함수

const loginAttempts = new Map();
const BF_MAX_FAILURES = 10;
const BF_WINDOW_MS = 15 * 60 * 1000; // 15분
const BF_LOCKOUT_MS = 15 * 60 * 1000; // 15분 잠금
const BF_MAP_MAX = 10000;

function getIP(req) {
  const xff = req.headers['x-forwarded-for'];
  return xff ? xff.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
}

function cleanup() {
  if (loginAttempts.size <= BF_MAP_MAX) return;
  const now = Date.now();
  for (const [k, v] of loginAttempts) {
    if (now - v.lastAttempt > BF_WINDOW_MS && now > (v.lockedUntil || 0)) {
      loginAttempts.delete(k);
    }
  }
}

function checkRate(req, res) {
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

function reportFailure(req, res) {
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
    cleanup();
    const retryAfterSec = Math.ceil(BF_LOCKOUT_MS / 1000);
    return res.status(429).json({
      locked: true, retryAfter: retryAfterSec,
      message: `Account locked for ${Math.ceil(retryAfterSec / 60)} minutes.`,
    });
  }

  loginAttempts.set(ip, record);
  cleanup();
  return res.json({ locked: false, remaining: BF_MAX_FAILURES - record.failures });
}

function reportSuccess(req, res) {
  const ip = getIP(req);
  loginAttempts.delete(ip);
  return res.json({ ok: true });
}

export default function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'check-rate':
      if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
      return checkRate(req, res);
    case 'report-failure':
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
      return reportFailure(req, res);
    case 'report-success':
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
      return reportSuccess(req, res);
    default:
      return res.status(404).json({ error: 'Unknown action' });
  }
}
