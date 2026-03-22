// Vercel Edge Middleware — /edu/ 정적 HTML JWT 인증
// 비로그인 사용자가 교육 HTML에 직접 접근 시 /login으로 리다이렉트
// 쿠키 'gotroot_auth_token' (Supabase access_token) 확인
//
// ⚠️ Non-Next.js 프로젝트: Web Standard API만 사용 가능
//    - request.nextUrl ❌ → new URL(request.url) ✅
//    - request.cookies.get() ❌ → request.headers.get('cookie') 파싱 ✅

export const config = {
  matcher: ['/edu/:path*'],
};

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

  // Supabase API로 토큰 유효성 확인
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

      if (!res.ok) {
        // 토큰 만료/무효 → 로그인 페이지로
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return Response.redirect(loginUrl.toString(), 302);
      }
    } catch {
      // Supabase 연결 실패 시 통과 (가용성 우선)
    }
  }

  // 인증 성공 → 원래 요청 통과
  return;
}
