import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStoredLang } from '../components/LangToggle';
import eduMeta from '../data/edu-meta.json';

// ── 레벨 표시 라벨 ──
const LEVEL_LABELS = {
  novice:       { ko: '입문',   en: 'Novice',       color: '#94a3b8' },
  beginner:     { ko: '초급',   en: 'Beginner',     color: '#22c55e' },
  intermediate: { ko: '중급',   en: 'Intermediate', color: '#3b82f6' },
  advanced:     { ko: '고급',   en: 'Advanced',     color: '#ef4444' },
  expert:       { ko: '전문가', en: 'Expert',       color: '#a855f7' },
};

// ── 다국어 ──
const uiText = {
  ko: {
    graphicTitle: '그래픽으로 이해하기',
    graphicSubtitle: '공격 기법의 흐름을 시각적으로 확인하세요',
    placeholderTitle: '그래픽 설명 콘텐츠',
    placeholderDesc: '이 영역에 인터랙티브 다이어그램, SVG 애니메이션, 공격 흐름도 등이 추가될 예정입니다.',
    nextBtn: '시나리오 기반 설명으로 →',
    backBtn: '과정 선택으로 돌아가기',
    step: '단계',
    stepOf: '/',
    loginRequired: '로그인이 필요합니다',
    loading: '로딩 중...',
  },
  en: {
    graphicTitle: 'Graphic Explanation',
    graphicSubtitle: 'Visualize the attack technique flow',
    placeholderTitle: 'Graphic Content',
    placeholderDesc: 'Interactive diagrams, SVG animations, and attack flow charts will be added here.',
    nextBtn: 'Scenario-Based Explanation →',
    backBtn: 'Back to Course Selection',
    step: 'Step',
    stepOf: '/',
    loginRequired: 'Login required',
    loading: 'Loading...',
  },
  zh: {
    graphicTitle: '图形化理解',
    graphicSubtitle: '通过视觉化方式理解攻击技术流程',
    placeholderTitle: '图形内容',
    placeholderDesc: '此区域将添加交互式图表、SVG动画和攻击流程图。',
    nextBtn: '基于场景的说明 →',
    backBtn: '返回课程选择',
    step: '步骤',
    stepOf: '/',
    loginRequired: '需要登录',
    loading: '加载中...',
  },
  hi: {
    graphicTitle: 'ग्राफिक समझ',
    graphicSubtitle: 'आक्रमण तकनीक के प्रवाह को दृश्य रूप से देखें',
    placeholderTitle: 'ग्राफिक सामग्री',
    placeholderDesc: 'इंटरएक्टिव डायग्राम, SVG एनिमेशन यहाँ जोड़े जाएंगे।',
    nextBtn: 'परिदृश्य-आधारित स्पष्टीकरण →',
    backBtn: 'कोर्स चयन पर वापस',
    step: 'चरण',
    stepOf: '/',
    loginRequired: 'लॉगिन आवश्यक',
    loading: 'लोड हो रहा है...',
  },
  ja: {
    graphicTitle: 'グラフィック解説',
    graphicSubtitle: '攻撃技法のフローを視覚的に確認',
    placeholderTitle: 'グラフィックコンテンツ',
    placeholderDesc: 'インタラクティブな図、SVGアニメーション、攻撃フローチャートが追加される予定です。',
    nextBtn: 'シナリオベース解説へ →',
    backBtn: 'コース選択に戻る',
    step: 'ステップ',
    stepOf: '/',
    loginRequired: 'ログインが必要です',
    loading: '読み込み中...',
  },
};

export default function GraphicExplanationPage() {
  const { techniqueId, level } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [lang] = useState(() => getStoredLang());
  const t = uiText[lang] || uiText.ko;

  const levelInfo = LEVEL_LABELS[level] || LEVEL_LABELS.beginner;

  // ── Auth Gate ──
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/edu/graphic/${techniqueId}/${level}`)}`);
      return;
    }
    setAuthChecked(true);
  }, [isLoggedIn, navigate, techniqueId, level]);

  const pageMeta = eduMeta.pages[techniqueId];

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-300/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col">
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1a]/80 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(`/edu/${techniqueId}`)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backBtn}
          </button>
          {/* 플로우 스텝 표시 */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400">1. 교육</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">2. 그래픽</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-500">3. 시나리오</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-500">4. 랩</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 레벨 배지 */}
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ color: levelInfo.color, borderColor: levelInfo.color + '50', backgroundColor: levelInfo.color + '15' }}
            >
              {lang === 'en' ? levelInfo.en : levelInfo.ko}
            </span>
            <span className="text-xs font-mono text-slate-500">{techniqueId}</span>
          </div>
        </div>
      </header>

      {/* ── 기법 정보 ── */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6 w-full">
        <div className="text-center mb-4">
          <span className="inline-block text-xs font-bold tracking-wider text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-3">
            🎨 {t.graphicTitle}
          </span>
          <h1 className="text-2xl md:text-3xl font-black mb-2">
            {lang === 'en' ? pageMeta?.titleEn : pageMeta?.title}
          </h1>
          <p className="text-slate-400 text-sm">{t.graphicSubtitle}</p>
        </div>
      </div>

      {/* ── 메인 콘텐츠 영역 (플레이스홀더) ── */}
      <div className="flex-1 max-w-6xl mx-auto px-4 w-full pb-32">
        <div className="rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-900/40 p-12 text-center min-h-[400px] flex flex-col items-center justify-center gap-6">
          {/* 아이콘 */}
          <div className="text-6xl opacity-40">🎨</div>

          {/* 설명 */}
          <div>
            <h2 className="text-xl font-bold text-slate-300 mb-3">{t.placeholderTitle}</h2>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">{t.placeholderDesc}</p>
          </div>

          {/* 예시 시각 요소 — 공격 흐름 더미 다이어그램 */}
          <div className="flex items-center gap-3 mt-4 opacity-30 flex-wrap justify-center">
            {['Attacker', 'C2 Server', 'Target Network', 'Compromised Host'].map((node, i, arr) => (
              <React.Fragment key={node}>
                <div className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-xs text-slate-400 whitespace-nowrap">
                  {node}
                </div>
                {i < arr.length - 1 && (
                  <span className="text-slate-600 text-lg">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="text-xs text-slate-600 mt-2">
            [{techniqueId} / {level}] 그래픽 콘텐츠 준비 중 — EduHtmlEditor에서 편집 가능
          </div>
        </div>
      </div>

      {/* ── 하단 네비게이션 바 ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1a]/95 backdrop-blur border-t border-slate-800/60 py-4 px-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/edu/${techniqueId}`)}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backBtn}
          </button>

          <button
            onClick={() => navigate(`/edu/scenario/${techniqueId}/${level}`)}
            className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <span>{t.nextBtn}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
