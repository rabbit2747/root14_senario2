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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[gotroot] FATAL: VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 .env에 없습니다.');
  process.exit(1);
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
