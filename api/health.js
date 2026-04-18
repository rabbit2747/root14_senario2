// Vercel Serverless — GET /api/health
// 목적: Supabase Pause 방지 (주 1회 Vercel Cron이 호출해 keep-alive 트래픽 생성)
// 보안: CRON_SECRET 검증으로 외부 호출 차단 (Vercel Cron은 자동으로 Authorization 헤더 주입)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel Cron은 Authorization: Bearer ${CRON_SECRET} 자동 전송
  // 수동 헬스체크(브라우저)도 허용하려면 CRON_SECRET 미설정 시 통과
  if (CRON_SECRET) {
    const auth = req.headers['authorization'] || '';
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const startedAt = Date.now();
  let supabaseOk = false;
  let supabaseStatus = null;
  let supabaseError = null;

  try {
    // 가장 가벼운 쿼리: HEAD + count=exact → 실제 row 미전송, 테이블 스캔 없음
    // announcements는 RLS로 authenticated만 SELECT 가능하지만, HEAD count는 anon key로도 테이블 존재만 확인
    // → wiki_terms도 동일. 실패해도 cron 자체는 성공 처리 (Supabase가 살아있으면 OK)
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/announcements?select=id&limit=1`,
      {
        method: 'HEAD',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact',
        },
      }
    );
    supabaseStatus = r.status;
    // 200/206(partial) 또는 401(RLS 차단)도 Supabase가 "살아있다"는 신호 → keep-alive 성공
    supabaseOk = r.status < 500;
  } catch (err) {
    supabaseError = err.message;
  }

  const elapsed = Date.now() - startedAt;

  // Pause 방지가 목적이므로 Supabase가 에러여도 200 반환 (Vercel cron 재시도 폭주 방지)
  return res.status(200).json({
    ok: true,
    service: 'gotroot-edu',
    supabase: {
      reachable: supabaseOk,
      status: supabaseStatus,
      error: supabaseError,
    },
    elapsedMs: elapsed,
    timestamp: new Date().toISOString(),
  });
}
