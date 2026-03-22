// Vercel Edge Middleware — /edu/ 정적 HTML JWT 인증
// 비로그인 사용자가 교육 HTML에 직접 접근 시 /login으로 리다이렉트
// 쿠키 'gotroot_auth_token' (Supabase access_token) 확인
//
// ⚠️ Non-Next.js 프로젝트: Web Standard API만 사용 가능
//    - request.nextUrl ❌ → new URL(request.url) ✅
//    - request.cookies.get() ❌ → request.headers.get('cookie') 파싱 ✅
//
// 💡 토큰 캐시: 동일 토큰은 5분간 Supabase API 재호출 없이 통과
//    Edge 인스턴스별 독립 캐시 (Vercel이 인스턴스 재사용 시 효과 발휘)

export const config = {
  matcher: ['/edu/:path*'],
};

// ── 토큰 검증 캐시 (5분 TTL, 인스턴스별) ──
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5분
const TOKEN_CACHE_MAX = 200;            // 최대 200개 (메모리 제한)
const tokenCache = new Map();           // token → { valid: boolean, expiresAt: number }

function getCachedToken(token) {
  const entry = tokenCache.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tokenCache.delete(token);
    return null;
  }
  return entry.valid;
}

function setCachedToken(token, valid) {
  // 캐시 크기 제한 — 초과 시 가장 오래된 항목 제거
  if (tokenCache.size >= TOKEN_CACHE_MAX) {
    const oldest = tokenCache.keys().next().value;
    tokenCache.delete(oldest);
  }
  tokenCache.set(token, { valid, expiresAt: Date.now() + TOKEN_CACHE_TTL });
}

/**
 * 쿠키 문자열에서 특정 키의 값을 추출
 */
function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // ── SPA 라우트 통과 (React Router + AuthContext가 인증 처리) ──

  // /edu/graphic/*, /edu/scenario/* → SPA 라우트
  if (pathname.startsWith('/edu/graphic/') || pathname.startsWith('/edu/scenario/')) {
    return;  // passthrough
  }

  // /edu/breadcrumb, /edu/progress-tracker, /edu/lab-link, /edu/graphic-link 등 JS 유틸리티
  if (pathname.match(/^\/edu\/[a-z-]+$/) && !pathname.match(/^\/edu\/t\d/)) {
    return;  // JS 파일 passthrough (cleanUrls로 .js 없이 접근 가능)
  }

  // /edu/:techniqueId (CourseSelector SPA 라우트) 패턴 감지
  // SPA: /edu/T1587.001 (대문자 T로 시작, 점 포함, 하이픈 없음)
  // HTML: /edu/t1587-001-malware-beginner (소문자, 하이픈 구분, 긴 이름)
  const segment = pathname.replace('/edu/', '');
  if (/^T\d/.test(segment)) {
    return;  // SPA 라우트 (T1587.001 형태 — 대문자 T로 시작)
  }

  // ── 정적 edu HTML에 대한 인증 확인 ──

  const cookieHeader = request.headers.get('cookie');
  const token = getCookie(cookieHeader, 'gotroot_auth_token');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return Response.redirect(loginUrl.toString(), 302);
  }

  // ── 캐시 히트 확인 (Supabase API 호출 절약) ──
  const cached = getCachedToken(token);
  if (cached === true) return;   // 유효 토큰 — API 호출 없이 통과
  if (cached === false) {        // 무효 토큰 — API 호출 없이 차단
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return Response.redirect(loginUrl.toString(), 302);
  }

  // ── 캐시 미스: Supabase API로 토큰 유효성 확인 ──
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setCachedToken(token, true);   // 성공 → 5분 캐시
        return;
      } else {
        setCachedToken(token, false);  // 실패 → 5분 캐시 (재시도 방지)
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return Response.redirect(loginUrl.toString(), 302);
      }
    } catch {
      // Supabase 연결 실패 시 통과 (가용성 우선, 캐시 안 함)
    }
  }

  // 인증 성공 또는 Supabase 미설정 → 원래 요청 통과
  return;
}
