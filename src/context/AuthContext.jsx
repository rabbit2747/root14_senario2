import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// ── 서버 측 인증용 쿠키 동기화 (Express server.js가 읽음) ──
function setAuthCookie(token) {
  document.cookie = `gotroot_auth_token=${token}; path=/; max-age=3600; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = 'gotroot_auth_token=; path=/; max-age=0; SameSite=Lax';
}

// ── 세션 타임아웃 설정 ──
const IDLE_TIMEOUT  = 10 * 60 * 1000;  // 10분 비활동 시 자동 로그아웃
const WARN_BEFORE   = 30 * 1000;       // 30초 전 경고 표시
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(null);

  // Refs for timer management (avoid stale closures)
  const idleTimerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const userRef = useRef(null);
  userRef.current = user;

  // 프로필에서 role 조회
  const fetchRole = async (uid) => {
    if (!uid) { setIsAdmin(false); setUserLevel(null); return; }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role, level')
        .eq('id', uid)
        .single();
      setIsAdmin(data?.role === 'admin');
      setUserLevel(data?.level || null);
    } catch {
      setIsAdmin(false);
      setUserLevel(null);
    }
  };

  const logout = useCallback(async () => {
    clearAuthCookie();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSessionWarning(null);
  }, []);

  // ── 유휴 타임아웃 로직 ──
  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (warnTimerRef.current) { clearTimeout(warnTimerRef.current); warnTimerRef.current = null; }
    setSessionWarning(null);
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (!userRef.current) return; // 로그인 상태에서만 타이머 동작

    clearIdleTimers();

    // 경고 타이머: IDLE_TIMEOUT - WARN_BEFORE 후 경고
    warnTimerRef.current = setTimeout(() => {
      setSessionWarning('30초 후 자동 로그아웃됩니다. 활동하면 유지됩니다.');
    }, IDLE_TIMEOUT - WARN_BEFORE);

    // 로그아웃 타이머: IDLE_TIMEOUT 후 로그아웃
    idleTimerRef.current = setTimeout(() => {
      if (userRef.current) {
        logout();
      }
    }, IDLE_TIMEOUT);
  }, [clearIdleTimers, logout]);

  // ── 활동 감지 이벤트 리스너 ──
  useEffect(() => {
    if (!user) {
      clearIdleTimers();
      return;
    }

    // 로그인 시 타이머 시작
    resetIdleTimer();

    // 활동 감지: throttle로 성능 최적화
    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity < 2000) return; // 2초 throttle
      lastActivity = now;
      resetIdleTimer();
    };

    ACTIVITY_EVENTS.forEach(evt =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach(evt =>
        window.removeEventListener(evt, handleActivity)
      );
      clearIdleTimers();
    };
  }, [user, resetIdleTimer, clearIdleTimers]);

  // ── 세션 복원 + 상태 감지 ──
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      await fetchRole(u?.id);   // role/level 로딩 완료 후 렌더링 (깜빡임 방지)
      setLoading(false);
      // 서버 측 인증 쿠키 동기화
      if (session?.access_token) setAuthCookie(session.access_token);
      else clearAuthCookie();
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchRole(u?.id);
      // 토큰 갱신(TOKEN_REFRESHED) 시에도 쿠키 자동 동기화
      if (session?.access_token) setAuthCookie(session.access_token);
      else clearAuthCookie();
    });

    // [IDOR 방어 #7] 5분마다 role 재검증
    const roleRefreshInterval = setInterval(() => {
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        if (u?.id) fetchRole(u.id);
        else { setUser(null); setIsAdmin(false); }
      });
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(roleRefreshInterval);
    };
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, logout, isLoggedIn: !!user, isAdmin, userLevel, sessionWarning }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
