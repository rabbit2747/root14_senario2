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
  // edu HTML은 자체 CSP meta 태그 보유 (cdn.tailwindcss.com 등 외부 CDN 허용)
  // 서버 CSP를 중복 적용하면 더 엄격한 쪽이 우선 → CDN 차단 → 디자인 깨짐
  const isEduPath = req.path.startsWith('/edu/');

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
  // x-forwarded-for: 리버스 프록시(Nginx/Cloudflare) 뒤에서 실제 클라이언트 IP
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || 'unknown';
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

// ── 방문자 IP 수집 (익명 포함 — 모든 페이지 접속 기록) ──
// IP당 1시간 1회만 기록 (DB 폭증 방지)
// Supabase REST API 직접 호출 (fire-and-forget)
const visitedIPs = new Map(); // key: ip, value: timestamp
const VISIT_LOG_COOLDOWN = 60 * 60 * 1000; // 1시간 (ms)
const VISITED_IPS_MAX = 10000;

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
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

// ── 서버 시작 ──
// 프로덕션: 외부 접근 허용 (0.0.0.0)
// ⚠️ Vite dev server와 다름 — dev는 127.0.0.1 (소스코드 노출 방지)
//    Express 프로덕션은 빌드된 dist만 서빙하므로 0.0.0.0 안전
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  GOTROOT Production Server                      ║');
  console.log(`║  http://0.0.0.0:${PORT}                            ║`);
  console.log('║  edu HTML auth: ENABLED (Supabase API)          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
