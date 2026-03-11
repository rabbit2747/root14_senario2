import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LangToggle, { getStoredLang, storeLang } from '../components/LangToggle';
import { ChevronDown, ChevronUp } from '@carbon/icons-react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const VALID_LEVELS = ['beginner', 'junior', 'intermediate', 'advanced', 'expert'];
const LEVEL_DISPLAY = {
  beginner: { ko: '비기너', emoji: '🟡' },
  junior: { ko: '초급', emoji: '🟢' },
  intermediate: { ko: '중급', emoji: '🔵' },
  advanced: { ko: '고급', emoji: '🔴' },
  expert: { ko: '전문가', emoji: '⭐' },
};

// ── 다국어 번역 ──
const signupT = {
  ko: {
    title: 'REGISTER',
    sub1: '(주)갓루트 사이버보안 교육 플랫폼',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    nameLabel: 'NAME', emailLabel: 'EMAIL', pwLabel: 'PASSWORD', pwConfirmLabel: 'CONFIRM PASSWORD',
    namePH: '홍길동', emailPH: 'operator@gotroot.com', pwPH: '6자 이상', pwConfirmPH: '비밀번호 재입력',
    privacyLabel: '[필수] 개인정보 수집·이용에 동의합니다',
    marketingLabel: '[선택] 광고·마케팅 수신에 동의합니다',
    viewContent: '내용 보기', hideContent: '접기',
    btnLoading: 'PROCESSING...', btnText: 'REGISTER',
    backToMatrix: 'Matrix',
    hasAccount: '이미 계정이 있으신가요?', login: '로그인',
    successTitle: 'Registration Complete',
    successMsg1: '> 가입 신청이 완료되었습니다.',
    successMsg2: '> 관리자 승인 후 로그인 가능합니다.',
    successMsg3: '> 승인까지 1–2 영업일이 소요될 수 있습니다.',
    toLogin: '> 로그인 페이지로 이동',
    errEmpty: '모든 항목을 입력해주세요.',
    errPwMismatch: '비밀번호가 일치하지 않습니다.',
    errPwShort: '비밀번호는 6자 이상이어야 합니다.',
    errPrivacy: '[필수] 개인정보 수집·이용에 동의해주세요.',
    errAlreadyReg: '이미 가입된 이메일입니다.',
  },
  en: {
    title: 'REGISTER',
    sub1: 'GOTROOT Cybersecurity Education Platform',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    nameLabel: 'NAME', emailLabel: 'EMAIL', pwLabel: 'PASSWORD', pwConfirmLabel: 'CONFIRM PASSWORD',
    namePH: 'John Doe', emailPH: 'operator@gotroot.com', pwPH: 'At least 6 characters', pwConfirmPH: 'Re-enter password',
    privacyLabel: '[Required] I agree to the Privacy & Data Collection Policy',
    marketingLabel: '[Optional] I agree to receive marketing communications',
    viewContent: 'View Details', hideContent: 'Collapse',
    btnLoading: 'PROCESSING...', btnText: 'REGISTER',
    backToMatrix: 'Dashboard',
    hasAccount: 'Already have an account?', login: 'Log In',
    successTitle: 'Registration Complete',
    successMsg1: '> Your application has been submitted.',
    successMsg2: '> You can log in after admin approval.',
    successMsg3: '> Approval may take 1–2 business days.',
    toLogin: '> Go to Login',
    errEmpty: 'Please fill in all fields.',
    errPwMismatch: 'Passwords do not match.',
    errPwShort: 'Password must be at least 6 characters.',
    errPrivacy: 'Please agree to the Privacy Policy.',
    errAlreadyReg: 'This email is already registered.',
  },
  zh: {
    title: 'REGISTER',
    sub1: 'GOTROOT 网络安全教育平台',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    nameLabel: '姓名', emailLabel: '邮箱', pwLabel: '密码', pwConfirmLabel: '确认密码',
    namePH: '张三', emailPH: 'operator@gotroot.com', pwPH: '至少6个字符', pwConfirmPH: '重新输入密码',
    privacyLabel: '[必填] 我同意个人信息收集和使用政策',
    marketingLabel: '[可选] 我同意接收营销信息',
    viewContent: '查看详情', hideContent: '收起',
    btnLoading: '处理中...', btnText: '注 册',
    backToMatrix: '仪表盘',
    hasAccount: '已有账号？', login: '登 录',
    successTitle: 'Registration Complete',
    successMsg1: '> 您的申请已提交。',
    successMsg2: '> 管理员批准后可登录。',
    successMsg3: '> 批准可能需要 1–2 个工作日。',
    toLogin: '> 前往登录页面',
    errEmpty: '请填写所有字段。',
    errPwMismatch: '两次密码不一致。',
    errPwShort: '密码至少需要6个字符。',
    errPrivacy: '请同意隐私政策。',
    errAlreadyReg: '该邮箱已注册。',
  },
  hi: {
    title: 'REGISTER',
    sub1: 'GOTROOT साइबर सुरक्षा शिक्षा प्लेटफ़ॉर्म',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    nameLabel: 'नाम', emailLabel: 'ईमेल', pwLabel: 'पासवर्ड', pwConfirmLabel: 'पासवर्ड पुनः दर्ज',
    namePH: 'नाम दर्ज करें', emailPH: 'operator@gotroot.com', pwPH: 'कम से कम 6 अक्षर', pwConfirmPH: 'पासवर्ड पुनः दर्ज',
    privacyLabel: '[आवश्यक] मैं व्यक्तिगत जानकारी संग्रह नीति से सहमत हूँ',
    marketingLabel: '[वैकल्पिक] मैं मार्केटिंग संचार प्राप्त करने के लिए सहमत हूँ',
    viewContent: 'विवरण देखें', hideContent: 'छुपाएं',
    btnLoading: 'प्रसंस्करण...', btnText: 'पंजीकरण',
    backToMatrix: 'डैशबोर्ड',
    hasAccount: 'पहले से खाता है?', login: 'लॉगिन',
    successTitle: 'Registration Complete',
    successMsg1: '> आपका आवेदन सबमिट हो गया।',
    successMsg2: '> व्यवस्थापक अनुमोदन के बाद लॉगिन करें।',
    successMsg3: '> अनुमोदन में 1–2 कार्य दिवस लग सकते हैं।',
    toLogin: '> लॉगिन पृष्ठ पर जाएं',
    errEmpty: 'कृपया सभी फ़ील्ड भरें।',
    errPwMismatch: 'पासवर्ड मेल नहीं खाते।',
    errPwShort: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए।',
    errPrivacy: 'कृपया गोपनीयता नीति से सहमत हों।',
    errAlreadyReg: 'यह ईमेल पहले से पंजीकृत है।',
  },
  ja: {
    title: 'REGISTER',
    sub1: 'GOTROOT サイバーセキュリティ教育プラットフォーム',
    sub2: 'GOTROOT CYBERSECURITY TRAINING PLATFORM',
    nameLabel: '名前', emailLabel: 'メール', pwLabel: 'パスワード', pwConfirmLabel: 'パスワード確認',
    namePH: '山田太郎', emailPH: 'operator@gotroot.com', pwPH: '6文字以上', pwConfirmPH: 'パスワード再入力',
    privacyLabel: '[必須] 個人情報収集・利用に同意します',
    marketingLabel: '[任意] マーケティング情報の受信に同意します',
    viewContent: '内容を見る', hideContent: '折り畳む',
    btnLoading: '処理中...', btnText: '新規登録',
    backToMatrix: 'ダッシュボード',
    hasAccount: 'すでにアカウントをお持ちですか？', login: 'ログイン',
    successTitle: 'Registration Complete',
    successMsg1: '> 申請が完了しました。',
    successMsg2: '> 管理者承認後にログインできます。',
    successMsg3: '> 承認には1〜2営業日かかる場合があります。',
    toLogin: '> ログインページへ',
    errEmpty: 'すべての項目を入力してください。',
    errPwMismatch: 'パスワードが一致しません。',
    errPwShort: 'パスワードは6文字以上にしてください。',
    errPrivacy: 'プライバシーポリシーに同意してください。',
    errAlreadyReg: 'このメールアドレスはすでに登録されています。',
  },
};

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState(() => getStoredLang());
  const [searchParams] = useSearchParams();

  const t = signupT[lang] || signupT.ko;

  // URL에서 level 파라미터 수신 + 허용 목록 검증
  const rawLevel = searchParams.get('level');
  const validLevel = VALID_LEVELS.includes(rawLevel) ? rawLevel : null;
  const levelInfo = validLevel ? LEVEL_DISPLAY[validLevel] : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !passwordConfirm) {
      setError(t.errEmpty);
      return;
    }
    if (password !== passwordConfirm) {
      setError(t.errPwMismatch);
      return;
    }
    if (password.length < 6) {
      setError(t.errPwShort);
      return;
    }
    if (!privacyConsent) {
      setError(t.errPrivacy);
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, marketing_consent: marketingConsent },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError(t.errAlreadyReg);
      } else {
        setError(signUpError.message);
      }
      setIsLoading(false);
      return;
    }

    // profiles 테이블에 marketing_consent + level 반영
    if (data.user) {
      const profileUpdate = { marketing_consent: marketingConsent };
      if (validLevel) profileUpdate.level = validLevel;
      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', data.user.id);
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-[#0d1b2a] flex items-center justify-center px-4 py-16">
        {/* 대시보드 이동 링크 (성공 화면) */}
        <Link
          to="/"
          className="fixed top-4 left-4 z-50 flex items-center gap-1 text-slate-500 hover:text-white text-xs font-bold font-mono transition-colors active:scale-95 px-2 py-1.5 rounded-md hover:bg-white/5"
        >
          <ArrowLeftIcon className="w-3 h-3" /> {t.backToMatrix}
        </Link>
        <div className="w-full max-w-md text-center">
          <div className="inline-block w-px h-16 bg-gradient-to-b from-green-500 to-transparent mb-6" />
          <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-4">
            {t.successTitle}
          </h1>
          <div className="bg-[#0d1b2a] border border-green-700/40 rounded-xl p-8">
            <p className="font-mono text-green-400 text-sm mb-2">{t.successMsg1}</p>
            <p className="font-mono text-slate-400 text-xs leading-relaxed">
              {t.successMsg2}<br />{t.successMsg3}
            </p>
          </div>
          <Link to="/login" className="inline-block mt-6 font-mono text-xs text-[#415a77] hover:underline">
            {t.toLogin}
          </Link>
        </div>
      </div>
    );
  }

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

        {/* 헤더 */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-block w-px h-12 sm:h-16 bg-gradient-to-b from-[#415a77] to-transparent mb-4 sm:mb-6" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-[0.12em] sm:tracking-[0.3em] uppercase">
            {t.title}
          </h1>
          <p className="text-slate-500 font-mono text-sm mt-2">{t.sub1}</p>
          <p className="text-slate-700 font-mono text-[10px] mt-1 tracking-wider">{t.sub2}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0d1b2a] border border-slate-700 rounded-xl p-5 sm:p-8 shadow-2xl"
        >
          {/* 레벨 테스트 결과 배지 */}
          {levelInfo && (
            <div className="mb-6 p-3 border border-[#415a77]/40 bg-[#415a77]/10 rounded-lg flex items-center gap-3">
              <span className="text-2xl">{levelInfo.emoji}</span>
              <div>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">판정 레벨</p>
                <p className="font-bold text-white text-sm tracking-wide">
                  {levelInfo.ko} <span className="text-slate-500 font-mono text-xs uppercase">({validLevel})</span>
                </p>
              </div>
            </div>
          )}

          {/* 이름 */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.namePH}
              className="w-full bg-[#0d1b2a] border border-slate-700 text-white placeholder-slate-600 px-4 py-3 rounded font-mono text-sm focus:outline-none focus:border-[#415a77] transition-colors"
            />
          </div>

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
          <div className="mb-5">
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

          {/* 비밀번호 확인 */}
          <div className="mb-5 sm:mb-7">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {t.pwConfirmLabel}
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder={t.pwConfirmPH}
              className="w-full bg-[#0d1b2a] border border-slate-700 text-white placeholder-slate-600 px-4 py-3 rounded font-mono text-sm focus:outline-none focus:border-[#415a77] transition-colors"
            />
          </div>

          {/* 구분선 */}
          <div className="border-t border-slate-700/50 mb-5" />

          {/* [필수] 개인정보 수집·이용 동의 */}
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacyConsent"
                checked={privacyConsent}
                onChange={e => setPrivacyConsent(e.target.checked)}
                className="mt-0.5 accent-[#415a77] w-4 h-4 shrink-0"
              />
              <div className="flex-1">
                <label htmlFor="privacyConsent" className="text-xs text-slate-300 cursor-pointer">
                  <span className="text-[#415a77] font-bold">[{lang === 'ko' ? '필수' : lang === 'zh' ? '必填' : lang === 'hi' ? 'आवश्यक' : lang === 'ja' ? '必須' : 'Required'}]</span>{' '}
                  {t.privacyLabel.replace(/^\[.*?\]\s*/, '')}
                </label>
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(v => !v)}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300 mt-1 underline inline-flex items-center gap-0.5"
                >
                  {privacyOpen ? <><ChevronUp size={12} /> {t.hideContent}</> : <><ChevronDown size={12} /> {t.viewContent}</>}
                </button>
              </div>
            </div>

            {privacyOpen && (
              <div className="mt-3 p-3 bg-[#0d1b2a] border border-slate-700 rounded text-[10px] font-mono text-slate-500 leading-relaxed max-h-40 overflow-y-auto">
                <p className="text-slate-400 font-bold mb-2">개인정보 수집·이용 동의서</p>
                <p><span className="text-slate-300">수집 항목:</span> 이메일, 이름</p>
                <p><span className="text-slate-300">수집 목적:</span> 회원 식별, 서비스 제공, 접속 이력 관리</p>
                <p><span className="text-slate-300">보유 기간:</span> 회원 탈퇴 시까지</p>
                <p><span className="text-slate-300">제3자 제공:</span> 없음</p>
                <p className="mt-2 text-slate-600">위 사항에 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.</p>
              </div>
            )}
          </div>

          {/* [선택] 광고·마케팅 수신 동의 */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketingConsent"
                checked={marketingConsent}
                onChange={e => setMarketingConsent(e.target.checked)}
                className="mt-0.5 accent-[#415a77] w-4 h-4 shrink-0"
              />
              <div className="flex-1">
                <label htmlFor="marketingConsent" className="text-xs text-slate-400 cursor-pointer">
                  <span className="text-slate-500 font-bold">[{lang === 'ko' ? '선택' : lang === 'zh' ? '可选' : lang === 'hi' ? 'वैकल्पिक' : lang === 'ja' ? '任意' : 'Optional'}]</span>{' '}
                  {t.marketingLabel.replace(/^\[.*?\]\s*/, '')}
                </label>
                <button
                  type="button"
                  onClick={() => setMarketingOpen(v => !v)}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300 mt-1 underline inline-flex items-center gap-0.5"
                >
                  {marketingOpen ? <><ChevronUp size={12} /> {t.hideContent}</> : <><ChevronDown size={12} /> {t.viewContent}</>}
                </button>
              </div>
            </div>

            {marketingOpen && (
              <div className="mt-3 p-3 bg-[#0d1b2a] border border-slate-700 rounded text-[10px] font-mono text-slate-500 leading-relaxed max-h-40 overflow-y-auto">
                <p className="text-slate-400 font-bold mb-2">광고·마케팅 수신 동의서</p>
                <p><span className="text-slate-300">수집 항목:</span> 이메일, 이름</p>
                <p><span className="text-slate-300">수집 목적:</span> 신규 교육 과정 안내, 이벤트·프로모션 정보 제공, 서비스 업데이트 알림</p>
                <p><span className="text-slate-300">발송 방법:</span> 이메일</p>
                <p><span className="text-slate-300">보유 기간:</span> 수신 동의 철회 시 또는 회원 탈퇴 시까지</p>
                <p className="mt-2"><span className="text-slate-300">동의 철회 방법:</span> 수신된 이메일 하단의 수신거부 링크 클릭 또는 고객센터(contact@gotroot.co.kr) 요청</p>
                <p className="mt-2 text-slate-600">본 동의는 선택 사항이며, 동의하지 않으셔도 서비스 이용에 제한이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 에러 */}
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

          <p className="text-center font-mono text-xs text-slate-600 mt-4">
            {t.hasAccount}{' '}
            <Link to="/login" className="text-slate-400 hover:text-white underline">
              {t.login}
            </Link>
          </p>
        </form>

        <div className="text-center font-mono mt-6 space-y-1">
          <p className="text-slate-500 text-[10px]">© 2026 (주)갓루트(GOTROOT) — ALL RIGHTS RESERVED</p>
          <p className="text-slate-700 text-[9px]">사업자등록번호 391-69-00617 | 대표 윤웅 | <a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">gotroot.co.kr</a></p>
          <p className="text-slate-800 text-[9px]">서울 구로구 디지털로33길 48, 대륭포스트타워 7차 305-P136호</p>
        </div>
      </div>
    </div>
  );
}
