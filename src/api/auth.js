/**
 * 🔐 인증 API
 * Phase 0: Supabase Auth 직접 호출
 * Phase 2 전환: JWT 기반 NestJS Auth Guard로 교체
 *
 * ⚠️ AuthContext의 onAuthStateChange(실시간 리스너)는 여기서 분리 불가
 *    Phase 2까지 AuthContext.jsx에서 직접 supabase.auth 사용 허용
 */
import { client } from './_client';

export const getSession  = ()              => client.auth.getSession();
export const getUser     = ()              => client.auth.getUser();
export const signIn      = (email, pw)     => client.auth.signInWithPassword({ email, password: pw });
export const signOut     = ()              => client.auth.signOut();
export const onAuthStateChange = (cb)      => client.auth.onAuthStateChange(cb);

/** 관리자 승인 여부 확인 (profiles.approved) */
export const getProfile  = (userId) =>
  client.from('profiles').select('approved, role, name').eq('id', userId).single();
