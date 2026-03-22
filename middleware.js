// Vercel Edge Middleware — /edu/*.html JWT 인증
// 비로그인 사용자가 교육 HTML에 직접 접근 시 /login으로 리다이렉트
// 쿠키 'gotroot_auth_token' (Supabase access_token) 존재+유효성 확인

export const config = {
  matcher: ['/edu/:path*.html'],
};

export default async function middleware(request) {
  const token = request.cookies.get('gotroot_auth_token')?.value;

  // 토큰 없음 → 로그인으로
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
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
        // 토큰 만료/무효 → 로그인으로
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return Response.redirect(loginUrl);
      }
    } catch {
      // Supabase 연결 실패 시 통과 (가용성 우선)
    }
  }

  // 인증 통과
  return undefined;
}
