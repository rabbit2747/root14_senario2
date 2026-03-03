import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.sessionStorage,  // 탭/브라우저 닫기 시 세션 소멸, 새로고침은 유지
  }
});

// 공인 IP 조회
export async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// 접속 로그 저장
export async function logAccess({ userId, email, ip, action, technique = null }) {
  await supabase.from('access_logs').insert({
    user_id: userId,
    email,
    ip,
    action,
    technique,
  });
}

// ── 관리자 감사 로그 (fire-and-forget) ──
export async function logAdminAudit(action, pageId, detail = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ip = await getPublicIP();
    await supabase.from('admin_audit_logs').insert({
      user_id: user.id,
      email: user.email,
      ip,
      action,
      page_id: pageId,
      detail,
    });
  } catch { /* 감사 로그 실패가 원래 작업을 막지 않음 */ }
}
