/**
 * Gotroot Production Server (Express)
 *
 * serve -s 정적 서버 대체 — /edu/*.html 서버 측 JWT 인증 추가
 *
 * 인증 방식:
 *   - 브라우저: AuthContext.jsx가 gotroot_auth_token 쿠키에 Supabase access_token 동기화
 *   - 서버: 쿠키 읽기 → Supabase API /auth/v1/user 호출로 토큰 검증 (5분 캐시)
 *
 * 보호 범위:
 *   - /edu/*.html → 인증 필수 (미인증 시 /login 리다이렉트)
 *   - /edu/*.js, /edu/*.css → 인증 불필요 (지원 스크립트)
 *   - 기타 모든 정적 파일 → 인증 불필요
 *
 * 롤백: serve-prod.sh에서 node server.js → serve -s dist 로 되돌리면 즉시 복귀
 *
 * @version v0.9.7
 * @since 2026-03-09
 */

import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

// ── 설정 ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4173;
const DIST_DIR = join(__dirname, 'dist');
const AIROOT_DIR = process.env.AIROOT_PATH || join(__dirname, '..', 'AIROOT');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
// Service Role Key: RLS 우회 — 서버 측 access_logs insert에 필수
// .env에 SUPABASE_SERVICE_ROLE_KEY 추가 필요 (Supabase 대시보드 → Settings → API)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[gotroot] FATAL: VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 .env에 없습니다.');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[gotroot] WARNING: SUPABASE_SERVICE_ROLE_KEY 미설정 — 익명 방문자 IP 수집이 RLS에 의해 차단될 수 있습니다.');
  console.warn('[gotroot]          Supabase 대시보드 → Settings → API → Service Role Key 복사 후 .env에 추가하세요.');
}

// ── 토큰 검증 캐시 (5분 TTL) ──
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function verifyToken(token) {
  // 캐시 확인
  const cached = tokenCache.get(token);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.valid;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    const valid = res.ok;
    tokenCache.set(token, { valid, ts: Date.now() });

    // 캐시 크기 제한 (1000개 초과 시 만료 항목 정리)
    if (tokenCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of tokenCache) {
        if (now - v.ts > CACHE_TTL) tokenCache.delete(k);
      }
    }

    return valid;
  } catch (err) {
    console.error('[gotroot] Token verification error:', err.message);
    return false;
  }
}

// ── Express 앱 ──
const app = express();

// 서버 정보 숨기기 (fingerprint 방지)
app.disable('x-powered-by');

// gzip 압축
app.use(compression());

// 쿠키 파서
app.use(cookieParser());

// ── 보안 헤더 (강화) ──
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
  "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${SUPABASE_URL} wss://${new URL(SUPABASE_URL).host} https://www.google-analytics.com https://region1.google-analytics.com`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // "upgrade-insecure-requests" — HTTPS 리버스 프록시 뒤에서만 활성화
  // 현재 HTTP 직접 서빙이므로 비활성화 (활성화 시 브라우저가 HTTPS 강제 → 접속 불가)
].join('; ');

app.use((req, res, next) => {
  // edu/airoot HTML은 자체 CSP meta 태그 보유 (cdn.tailwindcss.com 등 외부 CDN 허용)
  // 서버 CSP를 중복 적용하면 더 엄격한 쪽이 우선 → CDN 차단 → 디자인 깨짐
  const isEduPath = req.path.startsWith('/edu/') || req.path.startsWith('/airoot');

  // 기본 보안 헤더 (모든 경로 공통)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP — edu HTML은 자체 meta CSP 사용, SPA만 서버 CSP 적용
  if (!isEduPath) {
    res.setHeader('Content-Security-Policy', CSP_POLICY);
  }

  // HSTS — HTTPS 리버스 프록시 뒤에서만 활성화
  // 현재 HTTP 직접 서빙이므로 비활성화 (활성화 시 브라우저가 HTTPS 강제 → 접속 불가)
  // TODO: Nginx/Cloudflare 도입 후 활성화
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Permissions-Policy — 불필요한 브라우저 API 차단
  res.setHeader('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'bluetooth=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '));

  // 크로스 오리진 정책
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  // edu HTML은 외부 CDN(tailwindcss, google fonts) 로드 필요 → cross-origin 허용
  if (!isEduPath) {
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  } else {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }

  next();
});

// ── 로그인 브루트포스 방어 (서버 측 — IP 기반) ──
// 클라이언트 localStorage 방어를 보완 (개발자 도구 우회 불가)
// IP당 15분 윈도우 내 10회 실패 → 차단
const loginAttempts = new Map(); // key: ip, value: { failures: number, lockedUntil: number }
const BF_MAX_FAILURES = 10;
const BF_LOCKOUT_MS = 15 * 60 * 1000; // 15분
const BF_WINDOW_MS = 15 * 60 * 1000;  // 15분 윈도우
const LOGIN_ATTEMPTS_MAX = 50000;

function cleanupLoginAttempts() {
  const now = Date.now();
  if (loginAttempts.size > LOGIN_ATTEMPTS_MAX) {
    for (const [k, v] of loginAttempts) {
      if (now - v.lastAttempt > BF_WINDOW_MS && now > (v.lockedUntil || 0)) {
        loginAttempts.delete(k);
      }
    }
  }
}

// JSON body parser (API 엔드포인트용 — express.static 전에 배치)
app.use('/api/', express.json({ limit: '1kb' }));

// GET /api/auth/check-rate — 로그인 시도 전 레이트 체크
app.get('/api/auth/check-rate', (req, res) => {
  const ip = getClientIP(req);
  const record = loginAttempts.get(ip);

  if (!record) {
    return res.json({ allowed: true, remaining: BF_MAX_FAILURES });
  }

  // 잠금 상태 체크
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const retryAfterSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      allowed: false,
      remaining: 0,
      retryAfter: retryAfterSec,
      message: `Too many login attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.`,
    });
  }

  // 윈도우 만료 → 리셋
  if (Date.now() - record.lastAttempt > BF_WINDOW_MS) {
    loginAttempts.delete(ip);
    return res.json({ allowed: true, remaining: BF_MAX_FAILURES });
  }

  const remaining = Math.max(0, BF_MAX_FAILURES - record.failures);
  return res.json({ allowed: remaining > 0, remaining });
});

// POST /api/auth/report-failure — 로그인 실패 시 서버에 보고
app.post('/api/auth/report-failure', (req, res) => {
  const ip = getClientIP(req);
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
    cleanupLoginAttempts();

    const retryAfterSec = Math.ceil(BF_LOCKOUT_MS / 1000);
    console.log(`[gotroot] BRUTE FORCE LOCKOUT: IP ${ip} — ${record.failures} failures`);
    return res.status(429).json({
      locked: true,
      retryAfter: retryAfterSec,
      message: `Account locked for ${Math.ceil(retryAfterSec / 60)} minutes.`,
    });
  }

  loginAttempts.set(ip, record);
  cleanupLoginAttempts();

  return res.json({
    locked: false,
    remaining: BF_MAX_FAILURES - record.failures,
  });
});

// POST /api/auth/report-success — 로그인 성공 시 실패 카운트 초기화
app.post('/api/auth/report-success', (req, res) => {
  const ip = getClientIP(req);
  loginAttempts.delete(ip);
  return res.json({ ok: true });
});

// ── /api/ip — 클라이언트 IP 반환 (자체 호스팅, 제3자 의존 없음) ──
app.get('/api/ip', (req, res) => {
  // 리버스 프록시 미사용 → 소켓 IP 직접 사용 (XFF 스푸핑 방지)
  const ip = getClientIP(req);
  res.json({ ip });
});

// ── IP 지오로케이션 캐시 + 배치 조회 (관리자 대시보드용) ──
// ip-api.com 무료 플랜: 분당 45요청. 배치(최대 100개) + 24시간 캐시로 충분
const geoCache = new Map(); // key: ip, value: { country, countryCode, city, ts }
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간
const GEO_CACHE_MAX = 5000;

// 로컬/프라이빗 IP 판별
function isPrivateIP(ip) {
  return !ip || ip === 'unknown' || ip === '::1' ||
    ip.startsWith('127.') || ip.startsWith('10.') ||
    ip.startsWith('192.168.') || ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') || ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') || ip.startsWith('172.2') ||
    ip.startsWith('172.30.') || ip.startsWith('172.31.') ||
    ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80');
}

// POST /api/geoip — IP 배열 → 지오 정보 배치 반환
app.post('/api/geoip', async (req, res) => {
  const { ips } = req.body || {};
  if (!Array.isArray(ips) || ips.length === 0) {
    return res.json({});
  }

  // 최대 100개 제한
  const uniqueIps = [...new Set(ips)].slice(0, 100);
  const result = {};
  const toResolve = [];

  for (const ip of uniqueIps) {
    // 로컬 IP
    if (isPrivateIP(ip)) {
      result[ip] = { country: '로컬', countryCode: 'LOCAL', city: '-' };
      continue;
    }
    // 캐시 히트
    const cached = geoCache.get(ip);
    if (cached && (Date.now() - cached.ts) < GEO_CACHE_TTL) {
      result[ip] = { country: cached.country, countryCode: cached.countryCode, city: cached.city };
      continue;
    }
    toResolve.push(ip);
  }

  // 캐시 미스 → ip-api.com 배치 조회
  if (toResolve.length > 0) {
    try {
      const batchRes = await fetch('http://ip-api.com/batch?fields=query,country,countryCode,city,status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toResolve.map(ip => ({ query: ip, fields: 'query,country,countryCode,city,status' }))),
      });
      const batchData = await batchRes.json();

      for (const item of batchData) {
        if (item.status === 'success') {
          const geo = { country: item.country, countryCode: item.countryCode, city: item.city || '-' };
          result[item.query] = geo;
          geoCache.set(item.query, { ...geo, ts: Date.now() });
        } else {
          result[item.query] = { country: '알 수 없음', countryCode: '??', city: '-' };
        }
      }
    } catch (err) {
      console.error('[gotroot] GeoIP batch error:', err.message);
      // 실패 시 "알 수 없음" 반환
      for (const ip of toResolve) {
        if (!result[ip]) result[ip] = { country: '알 수 없음', countryCode: '??', city: '-' };
      }
    }
  }

  // 캐시 정리
  if (geoCache.size > GEO_CACHE_MAX) {
    const now = Date.now();
    for (const [k, v] of geoCache) {
      if (now - v.ts > GEO_CACHE_TTL) geoCache.delete(k);
    }
  }

  return res.json(result);
});

// ── AIROOT API 엔드포인트 (/api/airoot/*) ──
// AIROOT는 별도 HTML 프로젝트 → src/api/ 사용 불가 → server.js에서 직접 제공
// 모든 엔드포인트는 JWT 쿠키 인증 필수

async function requireAuth(req, res) {
  const token = req.cookies?.gotroot_auth_token;
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  const isValid = await verifyToken(token);
  if (!isValid) { res.status(401).json({ error: 'Invalid token' }); return null; }
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return { id: payload.sub, email: payload.email };
  } catch {
    res.status(401).json({ error: 'Token decode failed' });
    return null;
  }
}

// 관리자 확인 헬퍼 (profiles.role = 'admin')
async function checkIsAdmin(userId) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${userId}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const data = await r.json();
    return Array.isArray(data) && data.length > 0 && data[0].role === 'admin';
  } catch { return false; }
}

// HTML Sanitize 헬퍼 — allowlist 방식 XSS 방어
// 허용 태그: 리치텍스트 편집기에서 생성 가능한 안전한 태그만
function sanitizeHtml(html) {
  if (!html) return '';
  const ALLOWED_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 'span', 'br', 'p', 'div']);
  const ALLOWED_ATTRS = new Set(['class', 'style']);
  // 1) script/style/iframe 등 위험 태그 완전 제거 (내용 포함)
  let clean = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|select|button|link|meta|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  // 2) 자기 닫는 위험 태그도 제거
  clean = clean.replace(/<(script|style|iframe|object|embed|form|input|textarea|select|button|link|meta|svg|math)\b[^>]*\/?>/gi, '');
  // 3) on* 이벤트 핸들러 속성 제거
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // 4) javascript: URL 제거
  clean = clean.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');
  // 5) style 속성 내 위험 CSS 값 필터링
  clean = clean.replace(/style\s*=\s*"([^"]*)"/gi, (match, cssVal) => {
    // expression(), url(), import, behavior, -moz-binding, javascript 제거
    const dangerousCSS = /expression\s*\(|url\s*\(|@import|behavior\s*:|\\-moz\\-binding|javascript\s*:|vbscript\s*:|data\s*:/gi;
    if (dangerousCSS.test(cssVal)) {
      const safeVal = cssVal.replace(/expression\s*\([^)]*\)/gi, '')
        .replace(/url\s*\([^)]*\)/gi, '')
        .replace(/@import[^;]*/gi, '')
        .replace(/behavior\s*:[^;]*/gi, '')
        .replace(/-moz-binding\s*:[^;]*/gi, '')
        .replace(/javascript\s*:[^;]*/gi, '')
        .replace(/vbscript\s*:[^;]*/gi, '')
        .replace(/data\s*:[^;]*/gi, '')
        .trim();
      return safeVal ? `style="${safeVal}"` : '';
    }
    return match;
  });
  // 6) 허용되지 않은 태그 제거 (내용은 유지)
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    if (ALLOWED_TAGS.has(tag.toLowerCase())) {
      // 허용된 태그도 속성 필터링
      return match.replace(/\s+([a-zA-Z-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, (attrMatch, attrName) => {
        if (ALLOWED_ATTRS.has(attrName.toLowerCase())) return attrMatch;
        return '';
      });
    }
    return ''; // 태그만 제거, 내용은 유지
  });
  return clean.trim();
}

// GET /api/airoot/guestbook — 방명록 목록 (최신 100개, parent_id 포함)
app.get('/api/airoot/guestbook', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_guestbook?select=id,user_id,name,message,avatar,parent_id,created_at&order=created_at.desc&limit=100`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error('[airoot] Guestbook fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch guestbook' });
  }
});

// POST /api/airoot/guestbook — 방명록 작성
app.post('/api/airoot/guestbook', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { message, avatar, parent_id } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 500) {
    return res.status(400).json({ error: 'Invalid message (1-500 chars)' });
  }
  const name = user.email?.split('@')[0] || 'anonymous';
  const insertData = { user_id: user.id, name: sanitizeHtml(name), message: sanitizeHtml(message.trim()) };
  // avatar 컬럼이 있으면 저장 (없으면 Supabase가 무시)
  if (avatar && typeof avatar === 'string' && avatar.length <= 20) insertData.avatar = avatar;
  // parent_id: 답글인 경우 부모 글 ID
  if (parent_id && Number.isInteger(Number(parent_id)) && Number(parent_id) > 0) insertData.parent_id = Number(parent_id);
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_guestbook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(insertData),
    });
    const data = await r.json();
    res.status(201).json(data);
  } catch (err) {
    console.error('[airoot] Guestbook insert error:', err.message);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// GET /api/airoot/stats — 관리자 대시보드 통계 (access_logs 기반)
app.get('/api/airoot/stats', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  try {
    // 최근 7일 접속 로그 카운트 (날짜별)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const r = await fetch(`${SUPABASE_URL}/rest/v1/access_logs?select=created_at,action&created_at=gte.${sevenDaysAgo}&order=created_at.desc&limit=1000`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const logs = await r.json();

    // 날짜별 집계
    const dailyCounts = {};
    const uniqueIPs = new Set();
    let totalVisits = 0;
    for (const log of (Array.isArray(logs) ? logs : [])) {
      const date = log.created_at?.substring(0, 10);
      if (date) {
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        totalVisits++;
      }
    }

    // 최근 7일 배열 (빈 날짜 포함)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().substring(0, 10);
      chartData.push({ date: key, count: dailyCounts[key] || 0 });
    }

    res.json({ totalVisits, chartData, totalDays: 7 });
  } catch (err) {
    console.error('[airoot] Stats fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// DELETE /api/airoot/guestbook/:id — 방명록 삭제 (본인 또는 관리자)
app.delete('/api/airoot/guestbook/:id', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { id } = req.params;
  if (!id || isNaN(Number(id))) return res.status(400).json({ error: 'Invalid ID' });
  try {
    // 먼저 해당 메시지 소유자 확인
    const checkR = await fetch(`${SUPABASE_URL}/rest/v1/airoot_guestbook?select=user_id&id=eq.${id}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const rows = await checkR.json();
    if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const isOwner = rows[0].user_id === user.id;
    const admin = await checkIsAdmin(user.id);
    if (!isOwner && !admin) return res.status(403).json({ error: 'Forbidden' });

    await fetch(`${SUPABASE_URL}/rest/v1/airoot_guestbook?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[airoot] Guestbook delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// ── AIROOT 방명록 이모지 반응 API ──
// 반응 데이터는 서버 메모리 + 주기적 폴백 (Supabase 테이블 없이 작동)
// 향후 airoot_reactions 테이블 생성 시 영구 저장 전환
const _reactionStore = new Map(); // Map<guestbookId, { '👍': Set<userId>, '❤️': Set, '🔥': Set }>

// GET /api/airoot/reactions?ids=1,2,3 — 여러 방명록 반응 조회
app.get('/api/airoot/reactions', (req, res) => {
  const ids = (req.query.ids || '').split(',').filter(Boolean).map(Number);
  const result = {};
  ids.forEach(id => {
    const r = _reactionStore.get(id);
    if (r) {
      result[id] = {};
      for (const [emoji, users] of Object.entries(r)) {
        result[id][emoji] = users.size;
      }
    }
  });
  res.json(result);
});

// POST /api/airoot/reactions — 반응 토글 (추가/제거)
app.post('/api/airoot/reactions', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { guestbook_id, emoji } = req.body || {};
  const ALLOWED_EMOJI = ['👍', '❤️', '🔥'];
  if (!guestbook_id || !ALLOWED_EMOJI.includes(emoji)) {
    return res.status(400).json({ error: 'Invalid params' });
  }
  if (!_reactionStore.has(guestbook_id)) {
    _reactionStore.set(guestbook_id, { '👍': new Set(), '❤️': new Set(), '🔥': new Set() });
  }
  const store = _reactionStore.get(guestbook_id);
  const toggled = store[emoji].has(user.id);
  if (toggled) { store[emoji].delete(user.id); } else { store[emoji].add(user.id); }
  const counts = {};
  for (const [e, users] of Object.entries(store)) counts[e] = users.size;
  res.json({ toggled: !toggled, counts });
});

// ── AIROOT 회의록 API (/api/airoot/meetings) ──

// GET /api/airoot/meetings — 회의록 목록 (최신 50개)
app.get('/api/airoot/meetings', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_meetings?select=id,title,content,date,created_by,created_at&order=created_at.desc&limit=50`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const data = await r.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('[airoot] Meetings fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// POST /api/airoot/meetings — 회의록 작성 (로그인 사용자 모두)
app.post('/api/airoot/meetings', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { title, content, date } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const safeTitle = sanitizeHtml(title);
  const safeContent = sanitizeHtml(content);

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        title: safeTitle, content: safeContent,
        date: date || new Date().toISOString().substring(0, 10).replace(/-/g, '.'),
        created_by: user.id,
      }),
    });
    const data = await r.json();
    res.status(201).json(data);
  } catch (err) {
    console.error('[airoot] Meeting create error:', err.message);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// PUT /api/airoot/meetings/:id — 회의록 수정 (본인 또는 관리자)
app.put('/api/airoot/meetings/:id', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.params;
  const { title, content, date } = req.body || {};
  if (!title && !content && !date) return res.status(400).json({ error: 'Nothing to update' });

  // 본인 작성 여부 확인
  try {
    const checkR = await fetch(`${SUPABASE_URL}/rest/v1/airoot_meetings?select=created_by&id=eq.${id}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const rows = await checkR.json();
    const isOwner = Array.isArray(rows) && rows.length > 0 && rows[0].created_by === user.id;
    const admin = await checkIsAdmin(user.id);
    if (!isOwner && !admin) return res.status(403).json({ error: 'Permission denied' });
  } catch { return res.status(500).json({ error: 'Ownership check failed' }); }

  const updates = {};
  if (title) updates.title = sanitizeHtml(title);
  if (content) updates.content = sanitizeHtml(content);
  if (date) updates.date = date;
  updates.updated_at = new Date().toISOString();

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_meetings?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error('[airoot] Meeting update error:', err.message);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// DELETE /api/airoot/meetings/:id — 회의록 삭제 (본인 또는 관리자)
app.delete('/api/airoot/meetings/:id', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.params;
  // 본인 작성 여부 확인
  try {
    const checkR = await fetch(`${SUPABASE_URL}/rest/v1/airoot_meetings?select=created_by&id=eq.${id}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const rows = await checkR.json();
    const isOwner = Array.isArray(rows) && rows.length > 0 && rows[0].created_by === user.id;
    const admin = await checkIsAdmin(user.id);
    if (!isOwner && !admin) return res.status(403).json({ error: 'Permission denied' });
  } catch { return res.status(500).json({ error: 'Ownership check failed' }); }

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/airoot_meetings?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[airoot] Meeting delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// POST /api/airoot/cert — 수료증 저장
app.post('/api/airoot/cert', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { courseId, courseName } = req.body || {};
  if (!courseId) return res.status(400).json({ error: 'courseId required' });
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        course_id: courseId,
        course_name: courseName || courseId,
        issued_at: new Date().toISOString(),
      }),
    });
    if (!r.ok) {
      const err = await r.json();
      // 중복 수료증 무시 (unique constraint)
      if (err.code === '23505') return res.json({ ok: true, duplicate: true });
      throw new Error(err.message || 'Insert failed');
    }
    const data = await r.json();
    res.status(201).json({ ok: true, cert: data });
  } catch (err) {
    console.error('[airoot] Cert save error:', err.message);
    res.status(500).json({ error: 'Failed to save certificate' });
  }
});

// GET /api/airoot/cert/count — 수료증 총 발급 수 (인증 불필요)
app.get('/api/airoot/cert/count', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_certificates?select=id`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact',
      },
    });
    const count = parseInt(r.headers.get('content-range')?.split('/')[1] || '0', 10);
    res.json({ count });
  } catch (err) {
    console.error('[airoot] Cert count error:', err.message);
    res.status(500).json({ error: 'Failed to count certs', count: 0 });
  }
});

// GET /api/airoot/cert/by-course — 코스별 수료증 발급 수
app.get('/api/airoot/cert/by-course', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_certificates?select=course_id,course_name`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const data = await r.json();
    if (!Array.isArray(data)) return res.json([]);
    // 그룹핑
    const map = {};
    data.forEach(d => {
      const key = d.course_id || d.course_name || 'Unknown';
      const name = d.course_name || d.course_id || 'Unknown';
      if (!map[key]) map[key] = { courseId: key, courseName: name, count: 0 };
      map[key].count++;
    });
    res.json(Object.values(map));
  } catch (err) {
    console.error('[airoot] Cert by-course error:', err.message);
    res.json([]);
  }
});

// GET /api/airoot/active-users — 최근 5분 내 접속자 수 (인증 불필요)
app.get('/api/airoot/active-users', async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const r = await fetch(`${SUPABASE_URL}/rest/v1/access_logs?select=user_id&created_at=gte.${fiveMinAgo}`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact',
      },
    });
    const count = parseInt(r.headers.get('content-range')?.split('/')[1] || '0', 10);
    res.json({ activeUsers: count });
  } catch (err) {
    console.error('[airoot] Active users error:', err.message);
    res.json({ activeUsers: 0 });
  }
});

// ── AIROOT 코스 API (/api/airoot/courses) ──

// GET /api/airoot/courses — 코스 목록
app.get('/api/airoot/courses', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_courses?select=*&order=created_at.asc`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const data = await r.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('[airoot] Courses fetch error:', err.message);
    res.json([]); // 에러 시 빈 배열 (localStorage 폴백은 클라이언트에서)
  }
});

// POST /api/airoot/courses — 코스 추가 (관리자 전용)
app.post('/api/airoot/courses', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const admin = await checkIsAdmin(user.id);
  if (!admin) return res.status(403).json({ error: 'Admin only' });

  const { title, desc, file } = req.body || {};
  if (!title || !file) return res.status(400).json({ error: 'title and file required' });

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ title, description: desc || '', file_path: file, created_by: user.id }),
    });
    const data = await r.json();
    res.status(201).json(data);
  } catch (err) {
    console.error('[airoot] Course create error:', err.message);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// DELETE /api/airoot/courses/:id — 코스 삭제 (관리자 전용)
app.delete('/api/airoot/courses/:id', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const admin = await checkIsAdmin(user.id);
  if (!admin) return res.status(403).json({ error: 'Admin only' });

  const { id } = req.params;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/airoot_courses?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[airoot] Course delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ── AIROOT 댓글/피드백 API (/api/airoot/comments) ──

// GET /api/airoot/comments?page=deep-learning — 페이지별 댓글 목록
app.get('/api/airoot/comments', async (req, res) => {
  const page = req.query.page || 'general';
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_comments?select=id,user_id,email,nickname,content,page_id,created_at&page_id=eq.${encodeURIComponent(page)}&order=created_at.desc&limit=100`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const data = await r.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('[airoot] Comments fetch error:', err.message);
    res.json([]);
  }
});

// POST /api/airoot/comments — 댓글 작성 (로그인 필수)
app.post('/api/airoot/comments', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { content, page_id, nickname } = req.body || {};
  if (!content || !page_id) return res.status(400).json({ error: 'content and page_id required' });

  // 관리자 = 덕도리 쌤
  const admin = await checkIsAdmin(user.id);
  const finalNickname = admin ? '덕도리 쌤' : (nickname || user.email?.split('@')[0] || 'Anonymous');

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/airoot_comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        nickname: sanitizeHtml(finalNickname),
        content: sanitizeHtml(content),
        page_id,
      }),
    });
    const data = await r.json();
    res.status(201).json(data);
  } catch (err) {
    console.error('[airoot] Comment create error:', err.message);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// DELETE /api/airoot/comments/:id — 댓글 삭제 (본인 + 관리자)
app.delete('/api/airoot/comments/:id', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { id } = req.params;

  try {
    // 본인 댓글인지 확인
    const check = await fetch(`${SUPABASE_URL}/rest/v1/airoot_comments?select=user_id&id=eq.${id}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const rows = await check.json();
    if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const isOwner = rows[0].user_id === user.id;
    const admin = await checkIsAdmin(user.id);
    if (!isOwner && !admin) return res.status(403).json({ error: 'Forbidden' });

    await fetch(`${SUPABASE_URL}/rest/v1/airoot_comments?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[airoot] Comment delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ── 방문자 IP 수집 (익명 포함 — 모든 페이지 접속 기록) ──
// IP당 1시간 1회만 기록 (DB 폭증 방지)
// Supabase REST API 직접 호출 (fire-and-forget)
const visitedIPs = new Map(); // key: ip, value: timestamp
const VISIT_LOG_COOLDOWN = 60 * 60 * 1000; // 1시간 (ms)
const VISITED_IPS_MAX = 10000;

function getClientIP(req) {
  // ⚠️ 리버스 프록시(Nginx/Cloudflare) 미사용 환경:
  //    X-Forwarded-For는 클라이언트가 조작 가능 → 무조건 소켓 IP 사용
  //    TODO: 리버스 프록시 도입 시 app.set('trust proxy', '프록시IP') 설정 후
  //          req.ip 사용으로 전환 (Express가 trust proxy 기반으로 안전하게 처리)
  return req.socket?.remoteAddress || 'unknown';
}

async function logVisitorIP(ip, path, userId = null, email = null) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/access_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, // service role → RLS 우회
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        email: email || 'anonymous',
        ip,
        action: 'page_visit',
        technique: path,
      }),
    });
  } catch (err) {
    // fire-and-forget — 방문 로깅 실패가 서비스를 방해하면 안 됨
    console.error('[gotroot] Visitor IP log error:', err.message);
  }
}

app.use((req, res, next) => {
  // HTML 페이지 요청만 (API, 정적 에셋 제외)
  const ext = extname(req.path).toLowerCase();
  const isPageRequest = !ext || ext === '.html';
  const isApiRequest = req.path.startsWith('/api/');

  if (!isPageRequest || isApiRequest) return next();

  const ip = getClientIP(req);
  if (ip === 'unknown') return next();

  // 쿨다운 체크: 이미 1시간 내 기록된 IP는 건너뜀
  const lastVisit = visitedIPs.get(ip);
  const now = Date.now();
  if (lastVisit && (now - lastVisit) < VISIT_LOG_COOLDOWN) return next();

  // 기록 + 쿨다운 등록
  visitedIPs.set(ip, now);

  // 메모리 캐시 크기 제한 (만료 항목 정리)
  if (visitedIPs.size > VISITED_IPS_MAX) {
    for (const [k, v] of visitedIPs) {
      if (now - v > VISIT_LOG_COOLDOWN) visitedIPs.delete(k);
    }
  }

  // 인증된 사용자라면 user_id 추출 시도 (쿠키 JWT 디코딩)
  let userId = null;
  let email = null;
  const token = req.cookies?.gotroot_auth_token;
  if (token) {
    try {
      // JWT payload (2nd segment) 디코딩 (검증은 별도 — 여기선 로깅 목적)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub || null;
      email = payload.email || null;
    } catch { /* 디코딩 실패 무시 */ }
  }

  // fire-and-forget (응답 지연 없음)
  logVisitorIP(ip, req.path, userId, email);

  next();
});

// ── /edu/*.html 인증 미들웨어 (express.static 보다 먼저 실행) ──
app.use(async (req, res, next) => {
  // /edu/*.html 요청만 인증 검사
  if (!req.path.startsWith('/edu/') || !req.path.endsWith('.html')) {
    return next();
  }

  const token = req.cookies?.gotroot_auth_token;

  if (!token) {
    const loginUrl = `/login?redirect=${encodeURIComponent(req.path)}`;
    console.log(`[gotroot] AUTH BLOCKED (no cookie): ${req.path} → ${loginUrl}`);
    return res.redirect(302, loginUrl);
  }

  const isValid = await verifyToken(token);

  if (!isValid) {
    const loginUrl = `/login?redirect=${encodeURIComponent(req.path)}`;
    console.log(`[gotroot] AUTH BLOCKED (invalid token): ${req.path} → ${loginUrl}`);
    return res.redirect(302, loginUrl);
  }

  // 인증 성공 → 정적 파일 서빙으로 진행
  next();
});

// ── /airoot/* JWT 인증 + 정적 서빙 (별도 프로젝트) ──
// AIROOT는 ROOT14와 별개 폴더 (/Users/db/Desktop/AIROOT/)
// 같은 도메인이므로 gotroot_auth_token 쿠키 공유 → JWT 검증으로 인증
// 마이그레이션 시: AIROOT_PATH 환경변수로 경로 변경 가능
app.use('/airoot', async (req, res, next) => {
  // index.html 및 하위 HTML만 인증 검사 (mp4, css 등은 통과)
  const isHtml = !extname(req.path) || req.path.endsWith('.html');
  if (!isHtml) return next();

  const token = req.cookies?.gotroot_auth_token;
  if (!token) {
    return res.redirect(302, `/login?redirect=${encodeURIComponent('/airoot' + req.path)}`);
  }
  const isValid = await verifyToken(token);
  if (!isValid) {
    return res.redirect(302, `/login?redirect=${encodeURIComponent('/airoot' + req.path)}`);
  }
  next();
}, express.static(AIROOT_DIR, {
  index: 'index.html',
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    // AIROOT도 edu와 동일: 자체 CSP meta 보유 → 서버 CSP 미적용
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

// ── 정적 파일 서빙 (dist/) ──
app.use(express.static(DIST_DIR, {
  extensions: false,     // cleanUrls: false 동일 효과 — .html 확장자 자동 추가 안 함
  index: 'index.html',
  maxAge: '1d',          // 정적 에셋 1일 캐시
  setHeaders: (res, filePath) => {
    // HTML 파일은 캐시 안 함 (최신 버전 보장)
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

// ── SPA 폴백: 파일 확장자 없는 요청 → index.html ──
// 주의: /edu/T1583.001 같은 MITRE 기법 ID는 SPA 라우트이므로 index.html로 서빙
const STATIC_FILE_EXTS = new Set([
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav',
  '.json', '.map', '.txt', '.xml', '.webp', '.avif',
  '.pdf', '.zip', '.wasm',
]);

app.use((req, res) => {
  const ext = extname(req.path).toLowerCase();

  // 실제 정적 파일 확장자인데 찾지 못한 경우 → 404
  // .001, .002 같은 MITRE 기법 ID는 정적 파일이 아니므로 SPA로 넘김
  if (ext && STATIC_FILE_EXTS.has(ext)) {
    return res.status(404).send('Not Found');
  }

  // SPA 라우트 → index.html (React Router 처리)
  res.sendFile(join(DIST_DIR, 'index.html'));
});

// ── 커스텀 에러 핸들러 (스택 트레이스 노출 차단) ──
// Express 기본 에러 핸들러는 스택 트레이스를 반환 → OS, 사용자명, 경로 노출
// 반드시 모든 라우트/미들웨어 뒤에 위치해야 함 (4개 인자 필수)
app.use((err, req, res, _next) => {
  // 서버 로그에는 전체 에러 기록 (디버깅용)
  console.error(`[gotroot] ERROR ${req.method} ${req.path}:`, err.message);

  // JSON 파싱 에러 (잘못된 body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // 페이로드 크기 초과
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }

  // 그 외 모든 에러 — 상세 정보 노출 차단
  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({ error: 'Internal server error' });
});

// ── 서버 시작 ──
// 프로덕션: 외부 접근 허용 (0.0.0.0)
// ⚠️ Vite dev server와 다름 — dev는 127.0.0.1 (소스코드 노출 방지)
//    Express 프로덕션은 빌드된 dist만 서빙하므로 0.0.0.0 안전
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  ROOT14 Production Server                       ║');
  console.log(`║  http://0.0.0.0:${PORT}                            ║`);
  console.log('║  edu HTML auth: ENABLED (Supabase API)          ║');
  console.log(`║  AIROOT: ${AIROOT_DIR.substring(0,40).padEnd(40)}║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
