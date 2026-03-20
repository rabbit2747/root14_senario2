import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStoredLang } from '../components/LangToggle';
import eduMeta from '../data/edu-meta.json';
import { supabase } from '../lib/supabase';

// ── 레벨 표시 라벨 ──
const LEVEL_LABELS = {
  novice:       { ko: '입문',   en: 'Novice',       ja: '入門',       vi: 'Nhập môn', ar: 'مبتدئ',   color: '#94a3b8' },
  beginner:     { ko: '초급',   en: 'Beginner',     ja: '初級',       vi: 'Sơ cấp',   ar: 'مبتدئ',   color: '#22c55e' },
  intermediate: { ko: '중급',   en: 'Intermediate', ja: '中級',       vi: 'Trung cấp', ar: 'متوسط',  color: '#3b82f6' },
  advanced:     { ko: '고급',   en: 'Advanced',     ja: '上級',       vi: 'Nâng cao', ar: 'متقدم',   color: '#ef4444' },
  expert:       { ko: '전문가', en: 'Expert',       ja: 'エキスパート', vi: 'Chuyên gia', ar: 'خبير', color: '#a855f7' },
};

// ── 다국어 UI ──
const uiText = {
  ko: {
    scenarioTitle: '시나리오 기반 설명',
    scenarioSubtitle: '실제 공격 시나리오를 단계별로 따라가며 이해하세요',
    nextBtn: '실습 랩 시작하기 →',
    backBtn: '그래픽 설명으로 돌아가기',
    gameHint: '위 화면을 클릭하여 사이버 르네상스 시뮬레이션을 진행하세요.',
    comingSoon: '시나리오 준비 중',
    comingSoonDesc: '이 기법의 시나리오 콘텐츠가 준비 중입니다.\n랩으로 바로 이동할 수 있습니다.',
    labDirectBtn: '🧪 실습 랩 바로 시작하기',
    flowEdu: '1. 교육', flowGraphic: '2. 그래픽', flowScenario: '3. 시나리오', flowLab: '4. 랩',
    loadingScenario: '시나리오 로딩 중...',
  },
  en: {
    scenarioTitle: 'Scenario-Based Explanation',
    scenarioSubtitle: 'Follow a real attack scenario step by step',
    nextBtn: 'Start Lab →',
    backBtn: 'Back to Graphic Explanation',
    gameHint: 'Click the screen above to start the Cyber Renaissance simulation.',
    comingSoon: 'Scenario Coming Soon',
    comingSoonDesc: 'Scenario content for this technique is being prepared.\nYou can go directly to the lab.',
    labDirectBtn: '🧪 Go to Lab',
    flowEdu: '1. Education', flowGraphic: '2. Graphic', flowScenario: '3. Scenario', flowLab: '4. Lab',
    loadingScenario: 'Loading scenario...',
  },
  zh: {
    scenarioTitle: '基于场景的说明',
    scenarioSubtitle: '逐步跟随真实攻击场景',
    nextBtn: '开始实验室 →',
    backBtn: '返回图形说明',
    gameHint: '点击上方画面开始赛博文艺复兴模拟。',
    comingSoon: '场景准备中',
    comingSoonDesc: '该技术的场景内容正在准备中。\n您可以直接进入实验室。',
    labDirectBtn: '🧪 直接进入实验室',
    flowEdu: '1. 教育', flowGraphic: '2. 图解', flowScenario: '3. 场景', flowLab: '4. 实验室',
    loadingScenario: '场景加载中...',
  },
  hi: {
    scenarioTitle: 'परिदृश्य-आधारित स्पष्टीकरण',
    scenarioSubtitle: 'वास्तविक आक्रमण परिदृश्य का चरण दर चरण अनुसरण करें',
    nextBtn: 'लैब शुरू करें →',
    backBtn: 'ग्राफिक स्पष्टीकरण पर वापस',
    gameHint: 'सिमुलेशन शुरू करने के लिए ऊपर की स्क्रीन क्लिक करें।',
    comingSoon: 'परिदृश्य तैयार हो रहा है',
    comingSoonDesc: 'इस तकनीक के लिए परिदृश्य सामग्री तैयार की जा रही है।',
    labDirectBtn: '🧪 सीधे लैब जाएं',
    flowEdu: '1. शिक्षा', flowGraphic: '2. ग्राफिक', flowScenario: '3. परिदृश्य', flowLab: '4. लैब',
    loadingScenario: 'परिदृश्य लोड हो रहा है...',
  },
  ja: {
    scenarioTitle: 'シナリオベース解説',
    scenarioSubtitle: '実際の攻撃シナリオをステップバイステップで理解',
    nextBtn: '実習ラボを開始 →',
    backBtn: 'グラフィック解説に戻る',
    gameHint: '上の画面をクリックしてシミュレーションを開始してください。',
    comingSoon: 'シナリオ準備中',
    comingSoonDesc: 'この技法のシナリオコンテンツを準備中です。\nラボに直接移動できます。',
    labDirectBtn: '🧪 ラボへ直接移動',
    flowEdu: '1. 教育', flowGraphic: '2. グラフィック', flowScenario: '3. シナリオ', flowLab: '4. ラボ',
    loadingScenario: 'シナリオ読み込み中...',
  },
  vi: {
    scenarioTitle: 'Giải thích dựa trên kịch bản',
    scenarioSubtitle: 'Theo dõi kịch bản tấn công thực tế từng bước',
    nextBtn: 'Bắt đầu Lab →',
    backBtn: 'Quay lại giải thích đồ họa',
    gameHint: 'Nhấp vào màn hình trên để bắt đầu mô phỏng.',
    comingSoon: 'Kịch bản đang chuẩn bị',
    comingSoonDesc: 'Nội dung kịch bản cho kỹ thuật này đang được chuẩn bị.',
    labDirectBtn: '🧪 Đến Lab ngay',
    flowEdu: '1. Giáo dục', flowGraphic: '2. Đồ họa', flowScenario: '3. Kịch bản', flowLab: '4. Lab',
    loadingScenario: 'Đang tải kịch bản...',
  },
  ar: {
    scenarioTitle: 'شرح قائم على السيناريو',
    scenarioSubtitle: 'اتبع سيناريو الهجوم الفعلي خطوة بخطوة',
    nextBtn: '→ بدء المختبر',
    backBtn: 'العودة إلى الشرح البياني',
    gameHint: 'انقر على الشاشة أعلاه لبدء المحاكاة.',
    comingSoon: 'السيناريو قيد الإعداد',
    comingSoonDesc: 'محتوى السيناريو لهذه التقنية قيد الإعداد.',
    labDirectBtn: '🧪 الانتقال إلى المختبر',
    flowEdu: '1. التعليم', flowGraphic: '2. الرسوم', flowScenario: '3. السيناريو', flowLab: '4. المختبر',
    loadingScenario: 'جار تحميل السيناريو...',
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// [시나리오 컴포넌트 맵] — DesktopLab의 SCENARIO_LOADERS와 동일한 패턴
// 새 기법/레벨 추가 시 아래에 한 줄만 추가하면 됨
// key 형식: '{techniqueId}-{level}'
// ──────────────────────────────────────────────────────────────────────────────
const SCENARIO_COMPONENTS = {
  'T1587.001-beginner': React.lazy(() =>
    import('../data/scenario-contents/T1587.001-beginner')
  ),
  'T1566.001-novice': React.lazy(() =>
    import('../data/scenario-contents/T1566.001-novice')
  ),
  'T1566.001-beginner': React.lazy(() =>
    import('../data/scenario-contents/T1566.001-beginner')
  ),
  'T1566.001-intermediate': React.lazy(() =>
    import('../data/scenario-contents/T1566.001-intermediate')
  ),
  'T1566.001-advanced': React.lazy(() =>
    import('../data/scenario-contents/T1566.001-advanced')
  ),
  'T1566.001-expert': React.lazy(() =>
    import('../data/scenario-contents/T1566.001-expert')
  ),
};

// ──────────────────────────────────────────────────────────────────────────────
// [플레이스홀더] 미구현 시나리오 기법/레벨에 표시
// ──────────────────────────────────────────────────────────────────────────────
function DefaultScenarioPlaceholder({ onStart, t }) {
  return (
    <div className="w-full h-[500px] md:h-[650px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#0A0F1C]/60 text-center gap-5 px-6">
      <div className="text-5xl select-none">🚧</div>
      <div>
        <h2 className="text-lg font-bold text-slate-300 mb-2">{t.comingSoon}</h2>
        <p className="text-slate-500 text-sm whitespace-pre-line leading-relaxed">
          {t.comingSoonDesc}
        </p>
      </div>
      <button
        onClick={onStart}
        className="px-7 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] hover:brightness-110 cursor-pointer shadow-lg"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
      >
        {t.labDirectBtn}
      </button>
    </div>
  );
}

// ── Suspense 로딩 스피너 ──
function ScenarioLoader() {
  return (
    <div className="w-full h-[500px] md:h-[650px] flex items-center justify-center rounded-2xl border border-slate-700 bg-[#0A0F1C]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#DFB8B6]/30 border-t-[#DFB8B6] rounded-full animate-spin" />
        <p className="text-xs text-slate-500">{(uiText[getStoredLang()] || uiText.ko).loadingScenario}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [페이지 래퍼] — App.jsx BrowserRouter 안에서 렌더링
// ──────────────────────────────────────────────────────────────────────────────
export default function ScenarioExplanationPage() {
  const { techniqueId, level } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState('김요원');
  const [companyName] = useState('보안랩스');
  const [lang] = useState(() => getStoredLang());
  const t = uiText[lang] || uiText.ko;

  const levelInfo = LEVEL_LABELS[level] || LEVEL_LABELS.beginner;
  const pageMeta = eduMeta.pages[techniqueId];

  // 해당 기법/레벨에 맞는 시나리오 컴포넌트 조회
  const scenarioKey = `${techniqueId}-${level}`;
  const ScenarioComp = SCENARIO_COMPONENTS[scenarioKey] ?? null;

  // ── Auth Gate ──
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/edu/scenario/${techniqueId}/${level}`)}`);
      return;
    }
    setAuthChecked(true);
    // Supabase profiles에서 사용자 이름 fetch
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: p } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .single();
          if (p?.name) setUserName(p.name);
        }
      } catch (e) {}
    })();
  }, [isLoggedIn, navigate, techniqueId, level]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-300/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleFinish = () => navigate(`/lab/desktop/${techniqueId}/${level}`);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col">
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1a]/80 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(`/edu/graphic/${techniqueId}/${level}`)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backBtn}
          </button>
          {/* 플로우 스텝 */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400">{t.flowEdu}</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400">{t.flowGraphic}</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">{t.flowScenario}</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-500">{t.flowLab}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ color: levelInfo.color, borderColor: levelInfo.color + '50', backgroundColor: levelInfo.color + '15' }}
            >
              {levelInfo[lang] || levelInfo.ko}
            </span>
            <span className="text-xs font-mono text-slate-500">{techniqueId}</span>
          </div>
        </div>
      </header>

      {/* ── 타이틀 영역 ── */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 w-full">
        <div className="text-center mb-4">
          <span className="inline-block text-xs font-bold tracking-wider text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-3">
            📋 {t.scenarioTitle}
          </span>
          <h1 className="text-2xl md:text-3xl font-black mb-2">
            {lang !== 'ko' && pageMeta?.titleEn ? pageMeta.titleEn : pageMeta?.title}
          </h1>
          <p className="text-slate-400 text-sm">{t.scenarioSubtitle}</p>
        </div>
      </div>

      {/* ── 시나리오 컴포넌트 영역 ── */}
      <div className="flex-1 max-w-6xl mx-auto px-4 w-full pb-32">
        {ScenarioComp ? (
          <Suspense fallback={<ScenarioLoader />}>
            <ScenarioComp
              onFinish={handleFinish}
              userName={userName}
              companyName={companyName}
              lang={lang}
            />
          </Suspense>
        ) : (
          <DefaultScenarioPlaceholder onStart={handleFinish} t={t} />
        )}
        {ScenarioComp && (
          <p className="text-center text-xs text-slate-600 mt-4">{t.gameHint}</p>
        )}
      </div>

      {/* ── 하단 네비게이션 바 ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1a]/95 backdrop-blur border-t border-slate-800/60 py-3 md:py-4 px-3 md:px-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <button
            onClick={() => navigate(`/edu/graphic/${techniqueId}/${level}`)}
            className="text-xs md:text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 md:gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{t.backBtn}</span>
            <span className="sm:hidden">← 돌아가기</span>
          </button>
          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm text-white transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer whitespace-nowrap shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <span>🧪</span>
            <span className="hidden sm:inline">{t.nextBtn}</span>
            <span className="sm:hidden">랩 시작 →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
