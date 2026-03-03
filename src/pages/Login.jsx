import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase, getPublicIP, logAccess } from '../lib/supabase';
import LangToggle, { getStoredLang, storeLang } from '../components/LangToggle';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// ── 다국어 번역 ──
const loginT = {
  ko: {
    title: 'ACCESS REQUIRED',
    sub1: '(주)갓루트 사이버보안 교육 플랫폼',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    redirectMsg: '> 인증 후 교육 컨텐츠로 이동됩니다',
    emailLabel: 'EMAIL', pwLabel: 'PASSWORD',
    emailPH: 'operator@gotroot.com', pwPH: '••••••••',
    btnLoading: 'AUTHENTICATING...', btnText: 'AUTHENTICATE',
    errEmpty: '이메일과 비밀번호를 입력해주세요.',
    errWrong: '이메일 또는 비밀번호가 올바르지 않습니다.',
    errPending: '관리자 승인 대기 중입니다. 승인 후 로그인 가능합니다.',
    backToMatrix: 'Matrix',
    noAccount: '계정이 없으신가요?', signup: '회원가입',
  },
  en: {
    title: 'ACCESS REQUIRED',
    sub1: 'GOTROOT Cybersecurity Education Platform',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    redirectMsg: '> Authenticated → Redirecting to content',
    emailLabel: 'EMAIL', pwLabel: 'PASSWORD',
    emailPH: 'operator@gotroot.com', pwPH: '••••••••',
    btnLoading: 'AUTHENTICATING...', btnText: 'AUTHENTICATE',
    errEmpty: 'Please enter your email and password.',
    errWrong: 'Invalid email or password.',
    errPending: 'Awaiting admin approval. Please try again later.',
    backToMatrix: 'Dashboard',
    noAccount: "Don't have an account?", signup: 'Sign Up',
  },
  zh: {
    title: 'ACCESS REQUIRED',
    sub1: 'GOTROOT 网络安全教育平台',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    redirectMsg: '> 认证后将跳转至教育内容',
    emailLabel: '邮箱', pwLabel: '密码',
    emailPH: 'operator@gotroot.com', pwPH: '••••••••',
    btnLoading: '认证中...', btnText: '登 录',
    errEmpty: '请输入邮箱和密码。',
    errWrong: '邮箱或密码不正确。',
    errPending: '等待管理员批准，批准后可登录。',
    backToMatrix: '仪表盘',
    noAccount: '没有账号？', signup: '注 册',
  },
  hi: {
    title: 'ACCESS REQUIRED',
    sub1: 'GOTROOT साइबर सुरक्षा शिक्षा प्लेटफ़ॉर्म',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    redirectMsg: '> प्रमाणीकरण के बाद सामग्री पर जाएंगे',
    emailLabel: 'ईमेल', pwLabel: 'पासवर्ड',
    emailPH: 'operator@gotroot.com', pwPH: '••••••••',
    btnLoading: 'प्रमाणीकरण...', btnText: 'लॉगिन करें',
    errEmpty: 'कृपया ईमेल और पासवर्ड दर्ज करें।',
    errWrong: 'ईमेल या पासवर्ड गलत है।',
    errPending: 'व्यवस्थापक अनुमोदन की प्रतीक्षा है।',
    backToMatrix: 'डैशबोर्ड',
    noAccount: 'खाता नहीं है?', signup: 'पंजीकरण',
  },
  ja: {
    title: 'ACCESS REQUIRED',
    sub1: 'GOTROOT サイバーセキュリティ教育プラットフォーム',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    redirectMsg: '> 認証後、教育コンテンツへ移動します',
    emailLabel: 'メール', pwLabel: 'パスワード',
    emailPH: 'operator@gotroot.com', pwPH: '••••••••',
    btnLoading: '認証中...', btnText: 'ログイン',
    errEmpty: 'メールとパスワードを入力してください。',
    errWrong: 'メールまたはパスワードが正しくありません。',
    errPending: '管理者の承認待ちです。承認後にログインできます。',
    backToMatrix: 'ダッシュボード',
    noAccount: 'アカウントをお持ちでないですか？', signup: '新規登録',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState(() => getStoredLang());

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const t = loginT[lang] || loginT.ko;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t.errEmpty);
      return;
    }

    setIsLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(t.errWrong);
      setIsLoading(false);
      return;
    }

    // 관리자 승인 여부 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved')
      .eq('id', data.user.id)
      .single();

    if (!profile?.approved) {
      await supabase.auth.signOut();
      setError(t.errPending);
      setIsLoading(false);
      return;
    }

    // 로그인 성공 → IP 조회 후 접속 로그 저장
    const ip = await getPublicIP();
    await logAccess({
      userId: data.user.id,
      email: data.user.email,
      ip,
      action: 'login',
    });

    // 리다이렉트 URL 검증 (Open Redirect 방어: 내부 경로만 허용)
    if (redirectUrl) {
      const decoded = decodeURIComponent(redirectUrl);
      const isSafe = decoded.startsWith('/') && !decoded.startsWith('//') && !/^[a-z]+:/i.test(decoded.replace(/^\/+/, ''));
      window.location.href = isSafe ? decoded : '/';
    } else {
      navigate('/');
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

          {/* 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 border border-[#415a77] text-[#415a77] hover:bg-[#415a77] hover:text-white font-bold tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? t.btnLoading : t.btnText}
          </button>
        </form>

        <p className="text-center font-mono text-xs text-slate-600 mt-4">
          {t.noAccount}{' '}
          <Link to="/signup" className="text-slate-400 hover:text-white underline">
            {t.signup}
          </Link>
        </p>

        <div className="text-center font-mono mt-4 space-y-1">
          <p className="text-slate-500 text-[10px]">© 2026 (주)갓루트(GOTROOT) — ALL RIGHTS RESERVED</p>
          <p className="text-slate-700 text-[9px]">사업자등록번호 391-69-00617 | 대표 윤웅 | <a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">gotroot.co.kr</a></p>
          <p className="text-slate-800 text-[9px]">서울 구로구 디지털로33길 48, 대륭포스트타워 7차 305-P136호</p>
        </div>
      </div>
    </div>
  );
}
