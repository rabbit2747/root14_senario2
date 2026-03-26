import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase, getPublicIP, logAccess } from '../lib/supabase';
import LangToggle, { getStoredLang, storeLang } from '../components/LangToggle';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

// ── 다국어 번역 ──
const loginT = {
  ko: {
    title: 'ACCESS REQUIRED',
    sub1: 'ROOT14 Academy 사이버보안 교육 플랫폼',
    sub2: 'Decode ATT&CK. Grow with ROOT14',
    redirectMsg: '> 인증 후 교육 컨텐츠로 이동됩니다',
    emailLabel: 'EMAIL', pwLabel: 'PASSWORD',
    emailPH: 'operator@root14.co.kr', pwPH: '••••••••',
    btnLoading: 'AUTHENTICATING...', btnText: 'AUTHENTICATE',
    errEmpty: '이메일과 비밀번호를 입력해주세요.',
    errWrong: '이메일 또는 비밀번호가 올바르지 않습니다.',
    errPending: '관리자 승인 대기 중입니다. 승인 후 로그인 가능합니다.',
    errLocked: (min) => `로그인 시도가 너무 많습니다. ${min}분 후 다시 시도해주세요.`,
    attemptsLeft: (n) => `남은 시도 횟수: ${n}회`,
    lockWarning: '⚠ 5회 이상 로그인 실패 시 15분간 계정이 잠금됩니다.',
    backToMatrix: 'Matrix',
    noAccount: '계정이 없으신가요?', signup: '회원가입',
  },
  en: {
    title: 'ACCESS REQUIRED',
    sub1: 'ROOT14 Cybersecurity Education Platform',
    sub2: 'Decode ATT&CK. Grow with ROOT14',
    redirectMsg: '> Authenticated → Redirecting to content',
    emailLabel: 'EMAIL', pwLabel: 'PASSWORD',
    emailPH: 'operator@root14.co.kr', pwPH: '••••••••',
    btnLoading: 'AUTHENTICATING...', btnText: 'AUTHENTICATE',
    errEmpty: 'Please enter your email and password.',
    errWrong: 'Invalid email or password.',
    errPending: 'Awaiting admin approval. Please try again later.',
    errLocked: (min) => `Too many login attempts. Please try again in ${min} minutes.`,
    attemptsLeft: (n) => `Remaining attempts: ${n}`,
    lockWarning: '⚠ Account will be locked for 15 minutes after 5 failed attempts.',
    backToMatrix: 'Dashboard',
    noAccount: "Don't have an account?", signup: 'Sign Up',
  },
  zh: {
    title: 'ACCESS REQUIRED',
    sub1: 'ROOT14 网络安全教育平台',
    sub2: 'Decode ATT&CK. Grow with ROOT14',
    redirectMsg: '> 认证后将跳转至教育内容',
    emailLabel: '邮箱', pwLabel: '密码',
    emailPH: 'operator@root14.co.kr', pwPH: '••••••••',
    btnLoading: '认证中...', btnText: '登 录',
    errEmpty: '请输入邮箱和密码。',
    errWrong: '邮箱或密码不正确。',
    errPending: '等待管理员批准，批准后可登录。',
    errLocked: (min) => `登录尝试次数过多。请在${min}分钟后重试。`,
    attemptsLeft: (n) => `剩余尝试次数：${n}`,
    lockWarning: '⚠ 5次登录失败后，账户将被锁定15分钟。',
    backToMatrix: '仪表盘',
    noAccount: '没有账号？', signup: '注 册',
  },
  hi: {
    title: 'ACCESS REQUIRED',
    sub1: 'ROOT14 साइबर सुरक्षा शिक्षा प्लेटफ़ॉर्म',
    sub2: 'Decode ATT&CK. Grow with ROOT14',
    redirectMsg: '> प्रमाणीकरण के बाद सामग्री पर जाएंगे',
    emailLabel: 'ईमेल', pwLabel: 'पासवर्ड',
    emailPH: 'operator@root14.co.kr', pwPH: '••••••••',
    btnLoading: 'प्रमाणीकरण...', btnText: 'लॉगिन करें',
    errEmpty: 'कृपया ईमेल और पासवर्ड दर्ज करें।',
    errWrong: 'ईमेल या पासवर्ड गलत है।',
    errPending: 'व्यवस्थापक अनुमोदन की प्रतीक्षा है।',
    errLocked: (min) => `बहुत अधिक लॉगिन प्रयास। कृपया ${min} मिनट बाद पुनः प्रयास करें।`,
    attemptsLeft: (n) => `शेष प्रयास: ${n}`,
    lockWarning: '⚠ 5 बार लॉगिन विफल होने पर खाता 15 मिनट के लिए लॉक हो जाएगा।',
    backToMatrix: 'डैशबोर्ड',
    noAccount: 'खाता नहीं है?', signup: 'पंजीकरण',
  },
  ja: {
    title: 'ACCESS REQUIRED',
    sub1: 'ROOT14 サイバーセキュリティ教育プラットフォーム',
    sub2: 'Decode ATT&CK. Grow with ROOT14',
    redirectMsg: '> 認証後、教育コンテンツへ移動します',
    emailLabel: 'メール', pwLabel: 'パスワード',
    emailPH: 'operator@root14.co.kr', pwPH: '••••••••',
    btnLoading: '認証中...', btnText: 'ログイン',
    errEmpty: 'メールとパスワードを入力してください。',
    errWrong: 'メールまたはパスワードが正しくありません。',
    errPending: '管理者の承認待ちです。承認後にログインできます。',
    errLocked: (min) => `ログイン試行回数が多すぎます。${min}分後に再試行してください。`,
    attemptsLeft: (n) => `残り試行回数: ${n}`,
    lockWarning: '⚠ 5回以上ログインに失敗すると、15分間アカウントがロックされます。',
    backToMatrix: 'ダッシュボード',
    noAccount: 'アカウントをお持ちでないですか？', signup: '新規登録',
  },
};

// ── 브루트포스 방어 상수 ──
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15분 (ms)
const BF_STORAGE_KEY = 'gotroot_login_bf';

function getBfState() {
  try {
    const raw = localStorage.getItem(BF_STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    return JSON.parse(raw);
  } catch { return { attempts: 0, lockedUntil: 0 }; }
}
function setBfState(state) {
  localStorage.setItem(BF_STORAGE_KEY, JSON.stringify(state));
}

export default function Login() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState(() => getStoredLang());
  const [lockRemaining, setLockRemaining] = useState(0); // 잠금 남은 초
  const lockTimerRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // ── 이미 로그인된 유저 자동 리다이렉트 (무한 루프 방지) ──
  useEffect(() => {
    if (authLoading || !isLoggedIn) return;
    if (redirectUrl) {
      const decoded = decodeURIComponent(redirectUrl);
      const isSafe = decoded.startsWith('/') && !decoded.startsWith('//') && !/^[a-z]+:/i.test(decoded.replace(/^\/+/, ''));
      window.location.href = isSafe ? decoded : '/';
    } else {
      navigate('/', { replace: true });
    }
  }, [authLoading, isLoggedIn, redirectUrl, navigate]);

  // 잠금 상태 확인 + 카운트다운
  useEffect(() => {
    const tick = () => {
      const bf = getBfState();
      const remaining = Math.max(0, bf.lockedUntil - Date.now());
      setLockRemaining(remaining);
      if (remaining <= 0 && lockTimerRef.current) {
        clearInterval(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };
    tick();
    const bf = getBfState();
    if (bf.lockedUntil > Date.now()) {
      lockTimerRef.current = setInterval(tick, 1000);
    }
    return () => { if (lockTimerRef.current) clearInterval(lockTimerRef.current); };
  }, []);

  const t = loginT[lang] || loginT.ko;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── 브루트포스 잠금 체크 (클라이언트 측) ──
    const bf = getBfState();
    if (bf.lockedUntil > Date.now()) {
      const min = Math.ceil((bf.lockedUntil - Date.now()) / 60000);
      setError(t.errLocked(min));
      return;
    }

    if (!email || !password) {
      setError(t.errEmpty);
      return;
    }

    setIsLoading(true);

    // ── 서버 측 레이트 체크 (IP 기반, localStorage 우회 방지) ──
    try {
      const rateRes = await fetch('/api/auth/check-rate');
      if (rateRes.status === 429) {
        const rateData = await rateRes.json();
        const min = Math.ceil((rateData.retryAfter || 900) / 60);
        setError(t.errLocked(min));
        setIsLoading(false);
        return;
      }
    } catch { /* 서버 체크 실패 시 클라이언트 방어로 폴백 */ }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      // ── 실패 카운트 증가 (클라이언트 측) ──
      const newAttempts = bf.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        // 잠금 활성화
        const lockedUntil = Date.now() + LOCKOUT_DURATION;
        setBfState({ attempts: newAttempts, lockedUntil });
        setLockRemaining(LOCKOUT_DURATION);
        lockTimerRef.current = setInterval(() => {
          const rem = Math.max(0, lockedUntil - Date.now());
          setLockRemaining(rem);
          if (rem <= 0) { clearInterval(lockTimerRef.current); lockTimerRef.current = null; }
        }, 1000);
        const min = Math.ceil(LOCKOUT_DURATION / 60000);
        setError(t.errLocked(min));
      } else {
        setBfState({ ...bf, attempts: newAttempts });
        const left = MAX_ATTEMPTS - newAttempts;
        setError(`${t.errWrong} ${t.attemptsLeft(left)}`);
      }
      // ── 서버 측 실패 보고 (IP 기반 카운트 증가) ──
      fetch('/api/auth/report-failure', { method: 'POST' }).catch(() => {});
      // 실패 로그 기록 (IP 포함)
      getPublicIP().then(ip => {
        logAccess({ userId: null, email: email || 'unknown', ip, action: 'login_failed' }).catch(() => {});
      });
      setIsLoading(false);
      return;
    }

    // 관리자 승인 여부 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved, level')
      .eq('id', data.user.id)
      .single();

    if (!profile?.approved) {
      await supabase.auth.signOut();
      setError(t.errPending);
      setIsLoading(false);
      return;
    }

    // 로그인 성공 → 브루트포스 카운트 초기화 (클라이언트 + 서버)
    setBfState({ attempts: 0, lockedUntil: 0 });
    setLockRemaining(0);
    fetch('/api/auth/report-success', { method: 'POST' }).catch(() => {});

    // 로그인 성공 → IP 조회 후 접속 로그 저장
    const ip = await getPublicIP();
    await logAccess({
      userId: data.user.id,
      email: data.user.email,
      ip,
      action: 'login',
    });

    // 서버 측 인증용 쿠키 즉시 설정 (레이스컨디션 방어: onAuthStateChange 보다 먼저)
    if (data?.session?.access_token) {
      document.cookie = `gotroot_auth_token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax; Secure`;
    }

    // 리다이렉트 URL 검증 (Open Redirect 방어: 내부 경로만 허용)
    if (redirectUrl) {
      const decoded = decodeURIComponent(redirectUrl);
      const isSafe = decoded.startsWith('/') && !decoded.startsWith('//') && !/^[a-z]+:/i.test(decoded.replace(/^\/+/, ''));
      window.location.href = isSafe ? decoded : '/';
    } else {
      // 레벨 기반 분기: 미설정 → 레벨테스트, beginner/junior → /basics, 나머지 → /
      const userLevel = profile?.level;
      if (!userLevel) {
        navigate('/level-test');
      } else if (userLevel === 'beginner' || userLevel === 'junior') {
        navigate('/learning-path');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0d1b2a] flex items-center justify-center px-4 py-16">

      {/* 대시보드 이동 링크 (모바일 대응) */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-1 text-slate-500 hover:text-white text-xs font-bold font-mono transition-colors active:scale-95 px-2 py-1.5 rounded-md hover:bg-white/5"
      >
        <ArrowLeftIcon className="w-3 h-3" /> {t.backToMatrix}
      </Link>

      {/* 언어 선택 (공통 LangToggle) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <LangToggle
          lang={lang}
          theme="dark"
          onChange={(code) => { storeLang(code); setLang(code); }}
        />
      </div>

      <div className="w-full max-w-md">

        {/* 상단 헤더 */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-block w-px h-12 sm:h-16 bg-gradient-to-b from-[#415a77] to-transparent mb-4 sm:mb-6" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-[0.12em] sm:tracking-[0.3em] uppercase">
            {t.title}
          </h1>
          <p className="text-slate-500 font-mono text-sm mt-2">{t.sub1}</p>
          <p className="text-slate-700 font-mono text-[10px] mt-1 tracking-wider">{t.sub2}</p>
        </div>

        {/* 폼 카드 */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0d1b2a] border border-slate-700 rounded-xl p-5 sm:p-8 shadow-2xl"
        >
          {redirectUrl && (
            <div className="mb-6 p-3 border border-[#415a77]/30 bg-[#415a77]/5 rounded">
              <p className="font-mono text-xs text-[#415a77]">
                {t.redirectMsg}
              </p>
            </div>
          )}

          {/* 이메일 */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {t.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.emailPH}
              className="w-full bg-[#0d1b2a] border border-slate-700 text-white placeholder-slate-600 px-4 py-3 rounded font-mono text-sm focus:outline-none focus:border-[#415a77] transition-colors"
            />
          </div>

          {/* 비밀번호 */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {t.pwLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.pwPH}
              className="w-full bg-[#0d1b2a] border border-slate-700 text-white placeholder-slate-600 px-4 py-3 rounded font-mono text-sm focus:outline-none focus:border-[#415a77] transition-colors"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 font-mono text-xs text-[#415a77]">
              &gt; {error}
            </div>
          )}

          {/* 잠금 카운트다운 */}
          {lockRemaining > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded border border-red-800/40 bg-red-900/20 text-red-400 text-xs font-mono">
              <svg className="w-4 h-4 shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span>🔒 {Math.floor(lockRemaining / 60000)}:{String(Math.floor((lockRemaining % 60000) / 1000)).padStart(2, '0')}</span>
            </div>
          )}

          {/* 브루트포스 잠금 경고 (항상 표시) */}
          <p className="mb-4 font-mono text-[10px] text-slate-600 text-center">
            {t.lockWarning}
          </p>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={isLoading || lockRemaining > 0}
            className="w-full py-4 border border-[#415a77] text-[#415a77] hover:bg-[#415a77] hover:text-white font-bold tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? t.btnLoading : lockRemaining > 0 ? '🔒 LOCKED' : t.btnText}
          </button>
        </form>

        <p className="text-center font-mono text-xs text-slate-600 mt-4">
          {t.noAccount}{' '}
          <Link to="/signup" className="text-slate-400 hover:text-white underline">
            {t.signup}
          </Link>
        </p>

        <div className="text-center font-mono mt-4 space-y-1">
          <p className="text-slate-500 text-[10px]">© 2026 ROOT14 Academy — ALL RIGHTS RESERVED</p>
          <p className="text-slate-700 text-[9px]">사업자등록번호 391-69-00617 | 대표 윤웅 | <a href="https://root14.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">root14.co.kr</a></p>
          <p className="text-slate-800 text-[9px]">서울 구로구 디지털로33길 48, 대륭포스트타워 7차 305-P136호</p>
        </div>
      </div>
    </div>
  );
}
