// Vercel Edge Middleware — /edu/ 정적 HTML JWT 인증
// 비로그인 사용자가 교육 HTML에 직접 접근 시 /login으로 리다이렉트
// 쿠키 'gotroot_auth_token' (Supabase access_token) 확인

export const config = {
  // /edu/ 하위 경로만 인터셉트
  // 제외: /edu/graphic/*, /edu/scenario/* (SPA 라우트, React Router가 처리)
  // 포함: /edu/t1587-001-malware-beginner 등 (정적 HTML, cleanUrls로 .html 없이 접근)
  matcher: ['/edu/:path*'],
};

export default async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // SPA 라우트는 통과 — React Router + AuthContext가 인증 처리
  if (pathname.startsWith('/edu/graphic/') || pathname.startsWith('/edu/scenario/')) {
    return undefined;
  }

  // /edu/:techniqueId (CourseSelector SPA 라우트) 패턴 감지
  // SPA: /edu/T1587.001 (점 포함, 대문자 T로 시작)
  // HTML: /edu/t1587-001-malware-beginner (소문자, 하이픈 구분, 긴 이름)
  const segment = pathname.replace('/edu/', '');
  if (segment.includes('.') && !segment.includes('-')) {
    return undefined; // SPA 라우트 (T1587.001 형태)
  }

  // 정적 edu HTML에 대한 인증 확인
  const token = request.cookies.get('gotroot_auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return Response.redirect(loginUrl);
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
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return Response.redirect(loginUrl);
      }
    } catch {
      // Supabase 연결 실패 시 통과 (가용성 우선)
    }
  }

  return undefined;
}
