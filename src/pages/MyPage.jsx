import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStoredLang } from '../components/LangToggle';
import useEduProgress from '../hooks/useEduProgress';
import eduMeta from '../data/edu-meta.json';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 상수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TOTAL_TECHNIQUES = 62;
const ACCENT = '#415a77';
const STORAGE_CLICKS = 'gotroot_tech_clicks';
const STORAGE_LABS   = 'gotroot_completed_labs';
const STORAGE_THEME  = 'gotroot_theme';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 다국어 번역
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const translations = {
  ko: {
    title: '마이페이지',
    matrixProgress: '매트릭스 진행률',
    completedTraining: '완료한 훈련',
    goBack: '돌아가기',
    email: '이메일',
    userId: '사용자 ID',
    loginStatus: '로그인 상태',
    loggedIn: '인증됨',
    notLoggedIn: '미인증',
    techniquesClicked: '클릭한 기법',
    totalTechniques: '전체 기법',
    noCompletedLabs: '아직 완료한 훈련이 없습니다.',
    startTraining: '매트릭스에서 훈련을 시작해보세요!',
    profileSection: '프로필 정보',
    progressSection: '훈련 진행 현황',
    labsSection: '훈련 이력',
    eduProgressSection: '교육 진행률',
    eduChapterDone: '완료',
    eduChapterRemain: '남음',
    eduNotStarted: '아직 시작하지 않은 교육이 있습니다',
    statsSection: '플랫폼 통계',
    visitors: '방문자',
    finishers: '수료자',
    techniques: '기법 수',
  },
  en: {
    title: 'My Page',
    matrixProgress: 'Matrix Progress',
    completedTraining: 'Completed Training',
    goBack: 'Go Back',
    email: 'Email',
    userId: 'User ID',
    loginStatus: 'Login Status',
    loggedIn: 'Authenticated',
    notLoggedIn: 'Not Authenticated',
    techniquesClicked: 'Techniques Clicked',
    totalTechniques: 'Total Techniques',
    noCompletedLabs: 'No completed training yet.',
    startTraining: 'Start training from the matrix!',
    profileSection: 'Profile',
    progressSection: 'Training Progress',
    labsSection: 'Training History',
    eduProgressSection: 'Education Progress',
    eduChapterDone: 'done',
    eduChapterRemain: 'remaining',
    eduNotStarted: 'You have courses not yet started',
    statsSection: 'Platform Stats',
    visitors: 'Visitors',
    finishers: 'Finishers',
    techniques: 'Techniques',
  },
  zh: {
    title: '我的页面',
    matrixProgress: '矩阵进度',
    completedTraining: '已完成训练',
    goBack: '返回',
    email: '邮箱',
    userId: '用户 ID',
    loginStatus: '登录状态',
    loggedIn: '已认证',
    notLoggedIn: '未认证',
    techniquesClicked: '已点击技术',
    totalTechniques: '总技术数',
    noCompletedLabs: '暂无已完成的训练。',
    startTraining: '从矩阵开始训练吧！',
    profileSection: '个人信息',
    progressSection: '训练进度',
    labsSection: '训练历史',
    eduProgressSection: '教育进度',
    eduChapterDone: '完成',
    eduChapterRemain: '剩余',
    eduNotStarted: '还有未开始的课程',
  },
  hi: {
    title: 'मेरा पेज',
    matrixProgress: 'मैट्रिक्स प्रगति',
    completedTraining: 'पूर्ण प्रशिक्षण',
    goBack: 'वापस जाएं',
    email: 'ईमेल',
    userId: 'उपयोगकर्ता ID',
    loginStatus: 'लॉगिन स्थिति',
    loggedIn: 'प्रमाणित',
    notLoggedIn: 'अप्रमाणित',
    techniquesClicked: 'क्लिक की गई तकनीकें',
    totalTechniques: 'कुल तकनीकें',
    noCompletedLabs: 'अभी तक कोई प्रशिक्षण पूरा नहीं हुआ।',
    startTraining: 'मैट्रिक्स से प्रशिक्षण शुरू करें!',
    profileSection: 'प्रोफ़ाइल',
    progressSection: 'प्रशिक्षण प्रगति',
    labsSection: 'प्रशिक्षण इतिहास',
    eduProgressSection: 'शिक्षा प्रगति',
    eduChapterDone: 'पूर्ण',
    eduChapterRemain: 'शेष',
    eduNotStarted: 'अभी शुरू नहीं किए गए पाठ्यक्रम हैं',
  },
  ja: {
    title: 'マイページ',
    matrixProgress: 'マトリックス進捗',
    completedTraining: '完了したトレーニング',
    goBack: '戻る',
    email: 'メール',
    userId: 'ユーザーID',
    loginStatus: 'ログイン状態',
    loggedIn: '認証済み',
    notLoggedIn: '未認証',
    techniquesClicked: 'クリックした技法',
    totalTechniques: '全技法数',
    noCompletedLabs: 'まだ完了したトレーニングがありません。',
    startTraining: 'マトリックスからトレーニングを始めましょう！',
    profileSection: 'プロフィール',
    progressSection: 'トレーニング進捗',
    labsSection: 'トレーニング履歴',
    eduProgressSection: '教育進捗',
    eduChapterDone: '完了',
    eduChapterRemain: '残り',
    eduNotStarted: 'まだ始めていないコースがあります',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 아이콘 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const CheckCircleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#22c55e"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MyPage 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function MyPage({ darkMode: darkModeProp }) {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  // ── 다크모드 ──
  const [darkMode, setDarkMode] = useState(() => {
    if (darkModeProp !== undefined) return darkModeProp;
    try { return localStorage.getItem(STORAGE_THEME) === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    if (darkModeProp !== undefined) {
      setDarkMode(darkModeProp);
      return;
    }
    const handleStorage = (e) => {
      if (e.key === STORAGE_THEME) setDarkMode(e.newValue === 'dark');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [darkModeProp]);

  // ── 언어 ──
  const [lang, setLang] = useState(() => getStoredLang());
  const t = translations[lang] || translations.ko;

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = getStoredLang();
      if (stored !== lang) setLang(stored);
    }, 500);
    return () => clearInterval(interval);
  }, [lang]);

  // ── 플랫폼 통계 (localStorage 기반) ──
  const statsData = useMemo(() => {
    try {
      const visitors = parseInt(localStorage.getItem('gotroot_visitor_count') || '0', 10);
      return { visitors: Math.max(visitors, 1), finishers: 0 };
    } catch { return { visitors: 1, finishers: 0 }; }
  }, []);

  // ── 클릭 카운트 (localStorage) ──
  const clickCounts = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CLICKS) || '{}');
    } catch { return {}; }
  }, []);

  const clickedCount = Object.keys(clickCounts).length;
  const progressPercent = Math.min(Math.round((clickedCount / TOTAL_TECHNIQUES) * 100), 100);

  // ── 완료 랩 (localStorage) ──
  const completedLabs = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_LABS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, []);

  // ── 교육 진행률 (Supabase + localStorage) ──
  const { getProgress, completedTechIds, stats: eduStats } = useEduProgress();

  const eduProgressList = useMemo(() => {
    return Object.entries(eduMeta.pages || {}).map(([tid, meta]) => {
      const prog = getProgress(tid);
      return { tid, title: meta.title, titleEn: meta.titleEn, total: meta.chapters || 3, ...prog };
    }).sort((a, b) => {
      // 완료 → 진행중 → 미시작 순서
      const aScore = a.completed >= a.total ? 2 : a.completed > 0 ? 1 : 0;
      const bScore = b.completed >= b.total ? 2 : b.completed > 0 ? 1 : 0;
      if (bScore !== aScore) return bScore - aScore;
      return b.percent - a.percent;
    });
  }, [getProgress]);

  // ── 테마 색상 ──
  const theme = {
    bg:           darkMode ? '#0d1b2a' : '#e0e1dd',
    cardBg:       darkMode ? '#0d1b2a' : '#ffffff',
    cardBorder:   darkMode ? '#415a77' : '#e0e1dd',
    text:         darkMode ? '#e0e1dd' : '#0d1b2a',
    textMuted:    darkMode ? '#94a3b8' : '#64748b',
    textDim:      darkMode ? '#64748b' : '#94a3b8',
    barBg:        darkMode ? '#415a77' : '#e0e1dd',
    badgeBg:      darkMode ? '#064e3b' : '#ecfdf5',
    badgeBorder:  darkMode ? '#065f46' : '#a7f3d0',
    badgeText:    darkMode ? '#6ee7b7' : '#065f46',
    hoverBg:      darkMode ? '#415a77' : '#f1f5f9',
    sectionLabel: darkMode ? '#94a3b8' : '#64748b',
  };

  // ── 스타일 헬퍼 ──
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: theme.bg,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
    color: theme.text,
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const cardStyle = {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '8px',
    padding: '24px',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  };

  const sectionLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.sectionLabel,
    marginBottom: '16px',
  };

  return (
    <div style={containerStyle}>
      <div className="max-w-4xl mx-auto px-4 lg:px-6 2xl:px-8 py-8">

        {/* ── 헤더: 뒤로가기 + 타이틀 ── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 transition-colors duration-200"
            style={{
              color: theme.textMuted,
              fontSize: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '6px',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.backgroundColor = theme.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <ArrowLeftIcon />
            <span>{t.goBack}</span>
          </button>

          <h1 style={{
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '0.05em',
            color: theme.text,
          }}>
            <span style={{ color: ACCENT }}>&gt; </span>
            {t.title}
          </h1>

          {/* 우측 빈 공간으로 타이틀 중앙 정렬 */}
          <div style={{ width: '100px' }} />
        </div>

        {/* ── 0. 플랫폼 통계 카드 ── */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={sectionLabelStyle}>
            <ChartIcon />
            <span>{t.statsSection || 'Platform Stats'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: ACCENT }}>{statsData.visitors.toLocaleString()}</div>
              <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                👥 {t.visitors || 'Visitors'}
              </div>
            </div>
            <div style={{ width: '1px', height: '36px', backgroundColor: theme.cardBorder }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#22c55e' }}>{statsData.finishers}</div>
              <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                🏆 {t.finishers || 'Finishers'}
              </div>
            </div>
            <div style={{ width: '1px', height: '36px', backgroundColor: theme.cardBorder }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: theme.text }}>{TOTAL_TECHNIQUES}</div>
              <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                📊 {t.techniques || 'Techniques'}
              </div>
            </div>
          </div>
        </div>

        {/* ── 1. 프로필 정보 카드 ── */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={sectionLabelStyle}>
            <UserIcon />
            <span>{t.profileSection}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 이메일 */}
            <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
              <span style={{ color: theme.textMuted }}>{t.email}</span>
              <span style={{
                color: theme.text,
                fontWeight: '500',
                backgroundColor: darkMode ? '#0d1b2a' : '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {isLoggedIn && user ? user.email : '—'}
              </span>
            </div>

            {/* 사용자 ID */}
            <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
              <span style={{ color: theme.textMuted }}>{t.userId}</span>
              <span style={{
                color: theme.textDim,
                fontSize: '10px',
                backgroundColor: darkMode ? '#0d1b2a' : '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '4px',
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {isLoggedIn && user ? `${user.id.slice(0, 8)}-****-****-****-${user.id.slice(-4)}` : '—'}
              </span>
            </div>

            {/* 로그인 상태 */}
            <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
              <span style={{ color: theme.textMuted }}>{t.loginStatus}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: isLoggedIn
                  ? (darkMode ? 'rgba(34,197,94,0.15)' : '#ecfdf5')
                  : (darkMode ? 'rgba(239,68,68,0.15)' : '#fef2f2'),
                color: isLoggedIn
                  ? (darkMode ? '#4ade80' : '#16a34a')
                  : (darkMode ? '#f87171' : '#dc2626'),
                border: `1px solid ${isLoggedIn
                  ? (darkMode ? 'rgba(34,197,94,0.3)' : '#bbf7d0')
                  : (darkMode ? 'rgba(239,68,68,0.3)' : '#fecaca')}`,
              }}>
                {isLoggedIn ? t.loggedIn : t.notLoggedIn}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. 매트릭스 진행률 카드 ── */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={sectionLabelStyle}>
            <ChartIcon />
            <span>{t.progressSection}</span>
          </div>

          {/* 진행률 레이블 */}
          <div className="flex items-center justify-between" style={{ marginBottom: '12px', fontSize: '13px' }}>
            <span style={{ color: theme.text, fontWeight: '600' }}>{t.matrixProgress}</span>
            <span style={{ color: ACCENT, fontWeight: '700', fontSize: '14px' }}>
              {progressPercent}%
            </span>
          </div>

          {/* 프로그레스 바 */}
          <div style={{
            width: '100%',
            height: '14px',
            backgroundColor: theme.barBg,
            borderRadius: '7px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: ACCENT,
                borderRadius: '7px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: progressPercent > 0 ? '14px' : '0px',
                position: 'relative',
              }}
            >
              {/* 바 내부 빛나는 효과 */}
              {progressPercent > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '1px',
                  left: '4px',
                  right: '4px',
                  height: '4px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '2px',
                }} />
              )}
            </div>
          </div>

          {/* 상세 수치 */}
          <div className="flex items-center justify-between" style={{ marginTop: '10px', fontSize: '11px' }}>
            <span style={{ color: theme.textMuted }}>
              {t.techniquesClicked}: <span style={{ color: theme.text, fontWeight: '600' }}>{clickedCount}</span>
            </span>
            <span style={{ color: theme.textMuted }}>
              {t.totalTechniques}: <span style={{ color: theme.text, fontWeight: '600' }}>{TOTAL_TECHNIQUES}</span>
            </span>
          </div>

          {/* 클릭한 기법 목록 (5개 이상일 때만 축약 표시) */}
          {clickedCount > 0 && (
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.cardBorder}`,
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(clickCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 12)
                  .map(([name, count]) => (
                    <span
                      key={name}
                      style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: darkMode ? 'rgba(65,90,119,0.15)' : 'rgba(65,90,119,0.08)',
                        color: ACCENT,
                        border: `1px solid ${darkMode ? 'rgba(65,90,119,0.3)' : 'rgba(65,90,119,0.2)'}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                      {count > 1 && (
                        <span style={{ marginLeft: '4px', opacity: 0.6 }}>x{count}</span>
                      )}
                    </span>
                  ))}
                {clickedCount > 12 && (
                  <span style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    color: theme.textDim,
                  }}>
                    +{clickedCount - 12} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 3. 완료한 훈련 카드 ── */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={sectionLabelStyle}>
            <ClipboardIcon />
            <span>{t.labsSection}</span>
          </div>

          <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>
            {t.completedTraining}
            {completedLabs.length > 0 && (
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                fontWeight: '600',
                color: darkMode ? '#4ade80' : '#16a34a',
                backgroundColor: darkMode ? 'rgba(34,197,94,0.15)' : '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: `1px solid ${darkMode ? 'rgba(34,197,94,0.3)' : '#bbf7d0'}`,
              }}>
                {completedLabs.length}
              </span>
            )}
          </div>

          {completedLabs.length === 0 ? (
            /* 빈 상태 */
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: theme.textMuted,
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.4 }}>
                {/* 빈 클립보드 표현 */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                  style={{ display: 'inline-block', opacity: 0.3 }}>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="8" y1="16" x2="12" y2="16" />
                </svg>
              </div>
              <p style={{ fontSize: '12px', marginBottom: '4px' }}>{t.noCompletedLabs}</p>
              <p style={{ fontSize: '11px', color: theme.textDim }}>{t.startTraining}</p>
            </div>
          ) : (
            /* 완료 랩 목록 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedLabs.map((lab, idx) => {
                const labName = typeof lab === 'string' ? lab : (lab.name || lab.label || `Lab ${idx + 1}`);
                const labDate = typeof lab === 'object' && lab.completedAt
                  ? new Date(lab.completedAt).toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US')
                  : null;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: theme.badgeBg,
                      border: `1px solid ${theme.badgeBorder}`,
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <CheckCircleIcon size={18} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: theme.badgeText,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {labName}
                      </span>
                      {labDate && (
                        <span style={{
                          fontSize: '10px',
                          color: theme.textDim,
                          display: 'block',
                          marginTop: '2px',
                        }}>
                          {labDate}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: darkMode ? '#4ade80' : '#16a34a',
                      backgroundColor: darkMode ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      DONE
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 4. 교육 진행률 카드 ── */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={sectionLabelStyle}>
            <ChartIcon />
            <span>{t.eduProgressSection || 'Education Progress'}</span>
            {eduStats.completedPages > 0 && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '11px',
                fontWeight: '700',
                color: darkMode ? '#4ade80' : '#16a34a',
                backgroundColor: darkMode ? 'rgba(34,197,94,0.15)' : '#ecfdf5',
                padding: '2px 10px',
                borderRadius: '9999px',
                border: `1px solid ${darkMode ? 'rgba(34,197,94,0.3)' : '#bbf7d0'}`,
              }}>
                {eduStats.completedPages}/{eduStats.totalPages}
              </span>
            )}
          </div>

          {eduProgressList.filter(p => p.completed > 0).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: theme.textMuted }}>
              <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.3 }}>📚</div>
              <p style={{ fontSize: '12px' }}>{t.eduNotStarted || 'You have courses not yet started'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {eduProgressList.filter(p => p.completed > 0).map(p => {
                const isDone = p.completed >= p.total;
                return (
                  <div key={p.tid} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '6px',
                    backgroundColor: isDone
                      ? (darkMode ? 'rgba(34,197,94,0.08)' : '#f0fdf4')
                      : (darkMode ? 'rgba(59,130,246,0.08)' : '#eff6ff'),
                    border: `1px solid ${isDone
                      ? (darkMode ? 'rgba(34,197,94,0.2)' : '#bbf7d0')
                      : (darkMode ? 'rgba(59,130,246,0.2)' : '#bfdbfe')}`,
                  }}>
                    {/* 완료 아이콘 or 진행 아이콘 */}
                    {isDone ? (
                      <CheckCircleIcon size={16} />
                    ) : (
                      <span style={{ fontSize: '14px' }}>📖</span>
                    )}

                    {/* 제목 + 진행률 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '11px', fontWeight: '600',
                        color: isDone ? (darkMode ? '#6ee7b7' : '#065f46') : theme.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {p.tid} — {lang === 'en' ? (p.titleEn || p.title) : p.title}
                      </div>

                      {/* 챕터 도트 */}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                        {Array.from({ length: p.total }, (_, i) => {
                          const chId = `ch${i + 1}`;
                          const done = (p.chapters || []).includes(chId);
                          return (
                            <div key={i} style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              backgroundColor: done
                                ? (darkMode ? '#4ade80' : '#22c55e')
                                : (darkMode ? '#334155' : '#e2e8f0'),
                              border: `1px solid ${done
                                ? (darkMode ? '#22c55e' : '#16a34a')
                                : (darkMode ? '#475569' : '#cbd5e1')}`,
                              transition: 'background-color 0.2s ease',
                            }} title={`Chapter ${i + 1}: ${done ? '✅' : '⬜'}`} />
                          );
                        })}
                        <span style={{
                          fontSize: '9px', color: theme.textMuted, marginLeft: '4px',
                        }}>
                          {p.completed}/{p.total}
                        </span>
                      </div>
                    </div>

                    {/* 상태 라벨 */}
                    <span style={{
                      fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '4px',
                      color: isDone ? (darkMode ? '#4ade80' : '#16a34a') : (darkMode ? '#60a5fa' : '#2563eb'),
                      backgroundColor: isDone
                        ? (darkMode ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.1)')
                        : (darkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.1)'),
                    }}>
                      {isDone ? 'DONE' : `${p.percent}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 5. 매트릭스로 돌아가기 버튼 ── */}
        <div style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '32px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 28px',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              fontFamily: 'inherit',
              color: '#fff',
              backgroundColor: ACCENT,
              border: `1px solid ${ACCENT}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#334d6b';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 12px rgba(65,90,119,0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ACCENT;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ArrowLeftIcon />
            <span>{t.goBack}</span>
          </button>
        </div>

        {/* ── 푸터 워터마크 ── */}
        <div style={{
          textAlign: 'center',
          paddingBottom: '24px',
          fontSize: '10px',
          color: theme.textDim,
          letterSpacing: '0.05em',
        }}>
          GOTROOT CYBERSECURITY TRAINING PLATFORM
        </div>
      </div>
    </div>
  );
}
