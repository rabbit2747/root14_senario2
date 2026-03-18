import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useEduProgress from '../hooks/useEduProgress';
import eduMeta from '../data/edu-meta.json';
import { getStoredLang } from '../components/LangToggle';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingScreen from '../components/LoadingScreen';

// ── 다국어 UI 텍스트 ──
const uiText = {
  ko: {
    courseSelect: '과정 선택',
    novice: '입문',
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
    expert: '전문가',
    noviceDesc: '사이버보안의 기초 개념을 탐색합니다',
    beginnerDesc: '개념과 원리를 이해합니다',
    intermediateDesc: '공격/방어 기법을 실습합니다',
    advancedDesc: '실전 시뮬레이션으로 마무리합니다',
    expertDesc: '전문가 수준 심화 실전 훈련',
    chapters: '챕터',
    minutes: '분',
    start: '시작하기',
    resume: '이어하기',
    review: '복습하기',
    locked: '잠김',
    unlockNovice: '입문 과정을 완료하면 해금됩니다',
    unlockBeginner: '초급 과정을 완료하면 해금됩니다',
    unlockIntermediate: '중급 과정을 완료하면 해금됩니다',
    unlockAdvanced: '고급 과정을 완료하면 해금됩니다',
    comingSoon: '준비중',
    comingSoonDesc: '콘텐츠가 곧 추가됩니다',
    completed: '완료',
    backToMatrix: '매트릭스로 돌아가기',
    loginRequired: '로그인이 필요합니다',
    progress: '진행률',
    notFound: '해당 기법의 교육 콘텐츠를 찾을 수 없습니다',
    estimatedTime: '예상 소요시간',
  },
  en: {
    courseSelect: 'Select Course',
    novice: 'Novice',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
    noviceDesc: 'Explore the basics of cybersecurity',
    beginnerDesc: 'Understand concepts and principles',
    intermediateDesc: 'Practice attack/defense techniques',
    advancedDesc: 'Complete with real-world simulation',
    expertDesc: 'Expert-level deep practical training',
    chapters: 'Chapters',
    minutes: 'min',
    start: 'Start',
    resume: 'Resume',
    review: 'Review',
    locked: 'Locked',
    unlockNovice: 'Complete novice course to unlock',
    unlockBeginner: 'Complete beginner course to unlock',
    unlockIntermediate: 'Complete intermediate course to unlock',
    unlockAdvanced: 'Complete advanced course to unlock',
    comingSoon: 'Coming Soon',
    comingSoonDesc: 'Content will be added soon',
    completed: 'Completed',
    backToMatrix: 'Back to Matrix',
    loginRequired: 'Login required',
    progress: 'Progress',
    notFound: 'Training content not found for this technique',
    estimatedTime: 'Estimated Time',
  },
  zh: {
    courseSelect: '选择课程',
    novice: '入门',
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    expert: '专家',
    noviceDesc: '探索网络安全基础',
    beginnerDesc: '理解概念和原理',
    intermediateDesc: '练习攻防技术',
    advancedDesc: '通过实战模拟完成',
    expertDesc: '专家级深度实战训练',
    chapters: '章节',
    minutes: '分钟',
    start: '开始',
    resume: '继续',
    review: '复习',
    locked: '锁定',
    unlockNovice: '完成入门课程后解锁',
    unlockBeginner: '完成初级课程后解锁',
    unlockIntermediate: '完成中级课程后解锁',
    unlockAdvanced: '完成高级课程后解锁',
    comingSoon: '即将推出',
    comingSoonDesc: '内容即将添加',
    completed: '完成',
    backToMatrix: '返回矩阵',
    loginRequired: '需要登录',
    progress: '进度',
    notFound: '未找到该技术的培训内容',
    estimatedTime: '预计时间',
  },
  hi: {
    courseSelect: 'कोर्स चुनें',
    novice: 'नौसिखिया',
    beginner: 'शुरुआती',
    intermediate: 'मध्यवर्ती',
    advanced: 'उन्नत',
    expert: 'विशेषज्ञ',
    noviceDesc: 'साइबर सुरक्षा की मूल बातें',
    beginnerDesc: 'अवधारणाओं और सिद्धांतों को समझें',
    intermediateDesc: 'आक्रमण/रक्षा तकनीकों का अभ्यास करें',
    advancedDesc: 'वास्तविक सिमुलेशन के साथ पूर्ण करें',
    expertDesc: 'विशेषज्ञ स्तर का उन्नत प्रशिक्षण',
    chapters: 'अध्याय',
    minutes: 'मिनट',
    start: 'शुरू',
    resume: 'जारी रखें',
    review: 'समीक्षा',
    locked: 'लॉक',
    unlockNovice: 'नौसिखिया कोर्स पूरा करें',
    unlockBeginner: 'अनलॉक करने के लिए शुरुआती कोर्स पूरा करें',
    unlockIntermediate: 'अनलॉक करने के लिए मध्यवर्ती कोर्स पूरा करें',
    unlockAdvanced: 'उन्नत कोर्स पूरा करने पर अनलॉक होगा',
    comingSoon: 'जल्द आ रहा है',
    comingSoonDesc: 'सामग्री जल्द जोड़ी जाएगी',
    completed: 'पूर्ण',
    backToMatrix: 'मैट्रिक्स पर वापस',
    loginRequired: 'लॉगिन आवश्यक',
    progress: 'प्रगति',
    notFound: 'इस तकनीक के लिए प्रशिक्षण सामग्री नहीं मिली',
    estimatedTime: 'अनुमानित समय',
  },
  ja: {
    courseSelect: 'コースを選択',
    novice: '入門',
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級',
    expert: '専門家',
    noviceDesc: 'サイバーセキュリティの基礎を探索',
    beginnerDesc: '概念と原理を理解します',
    intermediateDesc: '攻撃/防御テクニックを実習します',
    advancedDesc: '実戦シミュレーションで仕上げます',
    expertDesc: '専門家レベルの深化実践訓練',
    chapters: 'チャプター',
    minutes: '分',
    start: '開始',
    resume: '続ける',
    review: '復習',
    locked: 'ロック中',
    unlockNovice: '入門コースを完了するとアンロックされます',
    unlockBeginner: '初級コースを完了するとアンロックされます',
    unlockIntermediate: '中級コースを完了するとアンロックされます',
    unlockAdvanced: '上級コースを完了するとアンロックされます',
    comingSoon: '準備中',
    comingSoonDesc: 'コンテンツが間もなく追加されます',
    completed: '完了',
    backToMatrix: 'マトリックスに戻る',
    loginRequired: 'ログインが必要です',
    progress: '進捗',
    notFound: 'このテクニックのトレーニングコンテンツが見つかりません',
    estimatedTime: '推定時間',
  },
};

// ── 레벨 설정 (5단계) ──
const LEVELS = [
  { key: 'novice',       color: '#f59e0b', colorLight: '#fef3c7', borderColor: '#fcd34d', emoji: '🟡', gradient: 'from-amber-400 to-yellow-500' },
  { key: 'beginner',     color: '#10b981', colorLight: '#d1fae5', borderColor: '#6ee7b7', emoji: '🟢', gradient: 'from-emerald-500 to-teal-600' },
  { key: 'intermediate', color: '#3b82f6', colorLight: '#dbeafe', borderColor: '#93c5fd', emoji: '🔵', gradient: 'from-blue-500 to-indigo-600' },
  { key: 'advanced',     color: '#ef4444', colorLight: '#fee2e2', borderColor: '#fca5a5', emoji: '🔴', gradient: 'from-red-500 to-rose-600' },
  { key: 'expert',       color: '#8b5cf6', colorLight: '#ede9fe', borderColor: '#c4b5fd', emoji: '⭐', gradient: 'from-violet-500 to-purple-600' },
];

export default function CourseSelector() {
  const { techniqueId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const { getProgress, isLevelComplete, isUnlocked, loading } = useEduProgress();
  const [language] = useState(() => getStoredLang());
  const [authChecked, setAuthChecked] = useState(false);

  const t = uiText[language] || uiText.en;

  // ── Auth Gate ──
  // authLoading이 true일 때는 아직 세션 확인 중이므로 리다이렉트 금지
  useEffect(() => {
    if (authLoading) return; // 세션 로딩 완료 대기
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/edu/${techniqueId}`)}`);
      return;
    }
    setAuthChecked(true);
  }, [authLoading, isLoggedIn, navigate, techniqueId]);

  // ── 기법 메타데이터 조회 (slug 역방향 매칭 포함) ──
  // /edu/t1587-001-malware 같은 슬러그로 접근 시 올바른 기법 ID를 찾아 리다이렉트
  const canonicalId = useMemo(() => {
    if (eduMeta.pages[techniqueId]) return techniqueId; // 정확히 일치
    // slug → URL 역방향 탐색 (/edu/{slug}.html 패턴)
    const slug = `/edu/${techniqueId}.html`;
    const found = Object.keys(eduMeta.pages).find(key => {
      const p = eduMeta.pages[key];
      if (p.url === slug) return true;
      return p.levels && Object.values(p.levels).some(l => l.url === slug);
    });
    return found || null;
  }, [techniqueId]);

  useEffect(() => {
    // slug로 접근 시 정식 URL로 리다이렉트
    if (canonicalId && canonicalId !== techniqueId) {
      navigate(`/edu/${canonicalId}`, { replace: true });
    }
  }, [canonicalId, techniqueId, navigate]);

  const pageMeta = useMemo(() => (canonicalId ? eduMeta.pages[canonicalId] : null), [canonicalId]);

  // ── 레벨별 카드 데이터 구성 ──
  const levelCards = useMemo(() => {
    if (!pageMeta) return [];
    return LEVELS.map(level => {
      const levelData = pageMeta.levels?.[level.key];
      const hasContent = levelData?.url != null;
      const prog = getProgress(techniqueId, level.key);
      const unlocked = isUnlocked(techniqueId, level.key);
      const completed = isLevelComplete(techniqueId, level.key);

      return {
        ...level,
        hasContent,
        url: levelData?.url || null,
        chapters: levelData?.chapters || 3,
        chapterTitles: levelData?.chapterTitles || [],
        estimatedMinutes: levelData?.estimatedMinutes || 20,
        chapterIds: levelData?.chapterIds || [],
        progress: prog,
        unlocked,
        completed,
      };
    });
  }, [pageMeta, techniqueId, getProgress, isUnlocked, isLevelComplete]);

  // ── 브레드크럼 상태 읽기 (Hooks는 early return 앞에 위치해야 함) ──
  const NAV_STATE_KEY = 'gotroot_nav_state';
  const navState = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem(NAV_STATE_KEY) || '{}'); }
    catch { return {}; }
  }, []);
  const breadcrumb = navState.breadcrumb || [];

  // ── 브레드크럼 클릭 핸들러 ──
  const handleCrumbClick = useCallback((crumb) => {
    try {
      const ns = JSON.parse(sessionStorage.getItem(NAV_STATE_KEY) || '{}');
      if (crumb.state) {
        Object.assign(ns, crumb.state);
      }
      sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(ns));
    } catch { /* ignore */ }
    navigate(crumb.path || '/');
  }, [navigate]);

  // ── 로딩/에러 처리 ──
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
        <div className="w-[95%] max-w-[850px] flex flex-col rounded-xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]">
          <div className="h-12 flex-shrink-0 flex items-center px-5 relative border-b bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1] rounded-t-xl">
            <div className="flex gap-2">
              <div className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>
            <div className="absolute w-full text-center left-0 text-sm font-semibold text-[#4d4d4d] pointer-events-none">Course_Selector.app</div>
          </div>
          <div className="p-[50px_60px] min-h-[450px] flex flex-col">
            <LoadingScreen
              steps={[
                { label: '인증 세션 확인', status: 'VERIFYING' },
                { label: '학습 진행률 조회', status: 'FETCHING' },
                { label: '과정 메타데이터 로딩', status: 'PARSING' },
                { label: '레벨 잠금 상태 계산', status: 'COMPUTING' },
              ]}
              isDark={false}
              title="Course Selector"
              subtitle="교육 과정 불러오는 중"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!pageMeta) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center text-slate-400 gap-4 px-4">
        <div className="text-5xl">📭</div>
        <div className="text-lg font-semibold">{t.notFound}</div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer inline-flex items-center gap-1"
        >
          <ArrowLeftIcon className="w-4 h-4" /> {t.backToMatrix}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* 헤더 + 브레드크럼 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1a]/80 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 브레드크럼 내비게이션 */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 overflow-hidden">
            {breadcrumb.length > 0 ? (
              <>
                {breadcrumb.map((crumb, i) => {
                  const isLast = (i === breadcrumb.length - 1);
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-slate-600 flex-shrink-0">/</span>}
                      {isLast ? (
                        <span className="text-white font-bold truncate max-w-[140px]">{crumb.label}</span>
                      ) : (
                        <button
                          onClick={() => handleCrumbClick(crumb)}
                          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {crumb.label}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
                <span className="text-slate-600 flex-shrink-0">/</span>
                <span className="text-cyan-400 font-bold truncate">{t.courseSelect}</span>
              </>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <ArrowLeftIcon className="w-4 h-4" /> {t.backToMatrix}
              </button>
            )}
          </nav>
          <div className="text-xs font-mono text-slate-500 flex-shrink-0 ml-3">{techniqueId}</div>
        </div>
      </header>

      {/* 기법 정보 영역 */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-4">
        <div className="text-center mb-2">
          <span className="inline-block text-xs font-bold tracking-wider text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            {pageMeta.tacticIds?.map(tid => tid.toUpperCase()).join(' · ')}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-center mb-2">
          {language === 'en' ? pageMeta.titleEn : pageMeta.title}
        </h1>
        <p className="text-center text-slate-400 text-sm mb-1">
          {pageMeta.titleEn && language !== 'en' && (
            <span className="text-slate-500">{pageMeta.titleEn}</span>
          )}
        </p>
        {pageMeta.tags?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {pageMeta.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 과정 선택 타이틀 */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <h2 className="text-center text-lg font-bold text-slate-300">
          {t.courseSelect}
        </h2>
      </div>

      {/* 레벨 카드 5장 */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {levelCards.map((card, idx) => {
            const isLocked = !card.unlocked;
            const isComingSoon = !card.hasContent;
            const isClickable = card.hasContent && card.unlocked;

            return (
              <div
                key={card.key}
                className={`relative group rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isClickable
                    ? 'cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-current/10'
                    : 'opacity-60 cursor-not-allowed'
                } ${card.completed ? 'ring-2 ring-offset-2 ring-offset-[#0a0f1a]' : ''}`}
                style={{
                  borderColor: isClickable ? card.color : '#334155',
                  ...(card.completed ? { ringColor: card.color } : {}),
                }}
                onClick={() => {
                  if (isClickable) {
                    // 브레드크럼에 레벨 추가 후 이동 (중복 방지)
                    try {
                      const ns = JSON.parse(sessionStorage.getItem(NAV_STATE_KEY) || '{}');
                      const bc = ns.breadcrumb || [];
                      const last = bc[bc.length - 1];
                      if (!last || last.path !== card.url) {
                        bc.push({ label: t[card.key], path: card.url });
                        ns.breadcrumb = bc;
                        sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(ns));
                      }
                    } catch { /* ignore */ }
                    window.location.href = card.url;
                  }
                }}
              >
                {/* 레벨 헤더 (그래디언트 배경) */}
                <div
                  className={`px-5 py-4 bg-gradient-to-r ${card.gradient}`}
                  style={{ opacity: isLocked || isComingSoon ? 0.5 : 1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{card.emoji}</span>
                      <span className="text-lg font-black tracking-wide">
                        {t[card.key]}
                      </span>
                    </div>
                    {card.completed && (
                      <span className="text-lg" title={t.completed}>✅</span>
                    )}
                    {isLocked && !isComingSoon && (
                      <span className="text-lg" title={t.locked}>🔒</span>
                    )}
                    {isComingSoon && (
                      <span className="text-xs font-bold bg-white/20 backdrop-blur px-2 py-0.5 rounded">
                        {t.comingSoon}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/80 mt-1">
                    {t[`${card.key}Desc`]}
                  </p>
                </div>

                {/* 카드 바디 */}
                <div className="bg-[#0f172a] px-5 py-5">
                  {/* 정보 행 */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span>📚 {card.chapters} {t.chapters}</span>
                    <span>⏱ ~{card.estimatedMinutes}{t.minutes}</span>
                  </div>

                  {/* 챕터 목록 (진행률은 순서 기반 — chapterId 이름 불일치 방지) */}
                  {card.chapterTitles.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {card.chapterTitles.map((title, cidx) => {
                        const isChapterDone = cidx < (card.progress?.completed || 0);
                        return (
                          <div key={cidx} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isChapterDone ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            <span className={isChapterDone ? 'text-slate-300' : 'text-slate-500'}>
                              {title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 진행률 바 */}
                  {card.hasContent && card.unlocked && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{t.progress}</span>
                        <span>{card.progress?.percent || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${card.progress?.percent || 0}%`,
                            backgroundColor: card.color,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA 버튼 */}
                  {isComingSoon ? (
                    <div className="text-center text-xs text-slate-600 py-2">
                      {t.comingSoonDesc}
                    </div>
                  ) : isLocked ? (
                    <div className="text-center text-xs text-slate-500 py-2 flex items-center justify-center gap-1.5">
                      <span>🔒</span>
                      <span>
                        {({
                          beginner: t.unlockNovice,
                          intermediate: t.unlockBeginner,
                          advanced: t.unlockIntermediate,
                          expert: t.unlockAdvanced,
                        })[card.key] || t.locked}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 cursor-pointer"
                      style={{ backgroundColor: card.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (card.url) {
                          try {
                            const ns = JSON.parse(sessionStorage.getItem(NAV_STATE_KEY) || '{}');
                            const bc = ns.breadcrumb || [];
                            const last = bc[bc.length - 1];
                            if (!last || last.path !== card.url) {
                              bc.push({ label: t[card.key], path: card.url });
                              ns.breadcrumb = bc;
                              sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(ns));
                            }
                          } catch { /* ignore */ }
                          window.location.href = card.url;
                        }
                      }}
                    >
                      {card.completed ? t.review : card.progress?.completed > 0 ? t.resume : t.start}
                    </button>
                  )}
                </div>

                {/* 완료 오버레이 보더 글로우 */}
                {card.completed && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ boxShadow: `inset 0 0 30px ${card.color}15, 0 0 20px ${card.color}10` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 푸터 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1a]/90 backdrop-blur border-t border-slate-800/40 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>ROOT14 Education Platform</span>
          <span>{techniqueId} · {pageMeta.difficulty}</span>
        </div>
      </div>
    </div>
  );
}
