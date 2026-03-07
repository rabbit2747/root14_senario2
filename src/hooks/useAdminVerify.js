import { useState, useRef, useCallback } from 'react';
// ✅ Phase 0: supabase.auth.signInWithPassword → api/auth.signIn 경유
// 분리 가능 이유: auth 단일 호출, DB 쿼리 없음, api/auth.js signIn 시그니처 완전 일치
import { signIn } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const CACHE_KEY = 'admin_verified_at';
const CACHE_TTL = 5 * 60 * 1000; // 5분

function isCacheValid() {
  const ts = sessionStorage.getItem(CACHE_KEY);
  return ts && (Date.now() - Number(ts)) < CACHE_TTL;
}

export default function useAdminVerify() {
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const pendingRef = useRef(null);
  const { user } = useAuth();

  // 검증 요청 — Promise<boolean> 반환
  const requestVerify = useCallback(() => {
    if (isCacheValid()) return Promise.resolve(true);

    return new Promise((resolve) => {
      pendingRef.current = resolve;
      setShowModal(true);
      setError(null);
    });
  }, []);

  // 비밀번호 제출
  const submitPassword = useCallback(async (password) => {
    if (!user?.email) {
      setError('사용자 정보를 찾을 수 없습니다');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      // ✅ api/auth.js 경유 — supabase 직접 호출 없음
      const { error: authError } = await signIn(user.email, password);

      if (authError) {
        setError('비밀번호가 일치하지 않습니다');
        return;
      }

      // 성공: 캐시 갱신 + 모달 닫기
      sessionStorage.setItem(CACHE_KEY, String(Date.now()));
      setShowModal(false);
      pendingRef.current?.(true);
      pendingRef.current = null;
    } catch {
      setError('인증 중 오류가 발생했습니다');
    } finally {
      setVerifying(false);
    }
  }, [user]);

  // 취소
  const cancelVerify = useCallback(() => {
    setShowModal(false);
    setError(null);
    pendingRef.current?.(false);
    pendingRef.current = null;
  }, []);

  return {
    showModal,
    verifying,
    error,
    requestVerify,
    submitPassword,
    cancelVerify,
  };
}
