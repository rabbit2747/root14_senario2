// APT 학습 모드 — /apt/:campaignId/study?level=intermediate
//
// v2 (2026-04-19): 5레이어 → 10챕터 공격자 관점 재구성
//   - CHAPTERS[] (10개, Ch1-3 full, Ch4-10 skeleton)
//   - ready:true 챕터만 순차 해금 (skeleton은 항상 "집필 중" 배너)
//   - Ch3에 DgaSandbox 인터랙티브 삽입
//
// macOS 윈도우 + 레벨 토글 + 프로그레스 + 사이드 내비는 유지

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as Study from './components';

// ── 동적 콘텐츠 로더 ──
const CONTENT_LOADERS = {
  C0024: () => import('../../../data/apt-content/C0024-solarwinds.jsx'),
};

const LEVEL_META = {
  novice:       { emoji: '🟡', ko: '입문',     color: '#eab308' },
  beginner:     { emoji: '🟢', ko: '초급',     color: '#22c55e' },
  intermediate: { emoji: '🔵', ko: '중급',     color: '#3b82f6' },
  advanced:     { emoji: '🔴', ko: '고급',     color: '#ef4444' },
  expert:       { emoji: '⭐', ko: '전문가',   color: '#a855f7' },
};
const LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];

// ── macOS 윈도우 래퍼 ──
function PageWrapper({ children, isDark, toggleTheme, onClose, title }) {
  return (
    <div className={`min-h-[100dvh] flex flex-col justify-center items-center transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#F4F1EA]'}`}>
      <div className={`w-[95%] max-w-[1000px] max-h-[94dvh] flex flex-col rounded-xl z-10 transition-all duration-300 ${isDark ? 'bg-[#242424] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]' : 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]'}`}>
        <div className={`h-12 flex-shrink-0 flex items-center px-5 relative border-b rounded-t-xl ${isDark ? 'bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] border-[#111]' : 'bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1]'}`}>
          <div className="flex gap-2">
            <button onClick={onClose} className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-70" title="상세로 돌아가기" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className={`absolute w-full text-center left-0 text-sm font-semibold pointer-events-none ${isDark ? 'text-[#a1a1aa]' : 'text-[#4d4d4d]'}`}>
            {title || 'APT_Study.app'}
          </div>
          <button onClick={toggleTheme} className={`ml-auto z-10 text-lg hover:scale-110 transition ${isDark ? 'text-yellow-400' : 'text-slate-600'}`}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ── 레벨 토글 ──
function LevelPicker({ currentLevel, availableLevels, onChange, isDark }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LEVELS.map(l => {
        const m = LEVEL_META[l];
        const active = currentLevel === l;
        const available = availableLevels.includes(l);
        return (
          <button
            key={l}
            onClick={() => onChange(l)}
            disabled={!available}
            title={!available ? '준비 중' : ''}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: active ? m.color : (isDark ? '#2d2d2d' : '#f0f0f0'),
              color: active ? '#fff' : m.color,
              border: `1px solid ${active ? m.color : 'transparent'}`,
            }}
          >
            {m.emoji} {m.ko}
          </button>
        );
      })}
    </div>
  );
}

// ── 프로그레스 바 ──
function ProgressBar({ current, total, isDark }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <div className={`flex justify-between items-center text-[10px] mb-1 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
        <span>읽은 챕터</span>
        <span className="font-mono font-bold">{current}/{total} · {pct}%</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]'}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: pct + '%', backgroundColor: '#3b82f6' }}
        />
      </div>
    </div>
  );
}

// ── 챕터 네비게이터 (좌측 목차) ──
function ChapterNav({ chapters, activeIdx, readIdxs, onJump, isDark }) {
  return (
    <nav
      className={`rounded-lg p-3 mb-5 ${
        isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-[#fafafa] border border-[#e5e5e5]'
      }`}
    >
      <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
        📖 목차 ({chapters.filter(c => c.ready).length} / {chapters.length} 풀콘텐츠)
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
        {chapters.map((c, i) => {
          const isActive = i === activeIdx;
          const isRead = readIdxs.has(i);
          const isReady = c.ready;
          return (
            <button
              key={c.id}
              onClick={() => isReady && onJump(i)}
              disabled={!isReady}
              className={`text-left px-2 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-600 text-white'
                  : isRead
                  ? isDark
                    ? 'bg-[#1a2a1a] text-emerald-300 hover:bg-[#1e3a1e]'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : isReady
                  ? isDark
                    ? 'bg-[#2a2a2a] text-[#ddd] hover:bg-[#333]'
                    : 'bg-white text-[#333] hover:bg-[#f0f0f0] border border-[#e5e5e5]'
                  : isDark
                  ? 'bg-[#15151a] text-[#555] cursor-not-allowed'
                  : 'bg-[#f0f0f0] text-[#aaa] cursor-not-allowed'
              }`}
              title={isReady ? c.title : '🚧 집필 중 — Ch1-3 톤 승인 후 오픈'}
            >
              <div className="font-mono text-[9px] opacity-75">
                Ch{c.num} {isReady ? '' : '🚧'}
              </div>
              <div className="truncate">{c.title.split(' — ')[0]}</div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── 준비중 레벨 안내 ──
function NotReadyPanel({ currentLevel, availableLevels, onSwitch, isDark }) {
  return (
    <div className={`p-8 text-center ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
      <div className="text-5xl mb-3">🚧</div>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {LEVEL_META[currentLevel]?.ko || currentLevel} 레벨은 준비 중입니다
      </h3>
      <p className={`text-sm mb-4 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
        현재 이 캠페인은 프로토타입 단계로, 아래 레벨만 풀 콘텐츠로 제공됩니다.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {availableLevels.map(l => {
          const m = LEVEL_META[l];
          return (
            <button
              key={l}
              onClick={() => onSwitch(l)}
              className="text-xs font-bold px-4 py-2 rounded-full transition-all"
              style={{ backgroundColor: m.color, color: '#fff' }}
            >
              {m.emoji} {m.ko} 레벨로 이동 →
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 용어 사전 ──
function Glossary({ items = [], isDark }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 6);
  return (
    <div
      className={`rounded-lg p-5 my-6 border ${
        isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#fafafa] border-[#e5e5e5]'
      }`}
    >
      <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        📖 용어 사전 <span className={`text-[10px] font-mono ${isDark ? 'text-[#888]' : 'text-[#999]'}`}>({items.length})</span>
      </h3>
      <div className="space-y-2">
        {visible.map((g, i) => (
          <div
            key={i}
            className={`text-xs flex gap-3 p-2 rounded ${
              isDark ? 'bg-[#2d2d2d]' : 'bg-white'
            }`}
          >
            <span
              className={`font-mono font-bold flex-shrink-0 ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}
              style={{ minWidth: '120px' }}
            >
              {g.term}
            </span>
            <span className={isDark ? 'text-[#ccc]' : 'text-[#555]'}>{g.def}</span>
          </div>
        ))}
      </div>
      {items.length > 6 && (
        <button
          onClick={() => setExpanded(v => !v)}
          className={`mt-3 text-xs font-semibold px-3 py-1 rounded ${
            isDark ? 'bg-[#2d2d2d] hover:bg-[#333] text-white' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a]'
          }`}
        >
          {expanded ? '접기' : `더 보기 (+${items.length - 6})`}
        </button>
      )}
    </div>
  );
}

// ── 메인 페이지 ──
export default function AptStudyPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 쿼리에서 level 읽기 (기본 intermediate)
  const initialLevel = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    const l = qs.get('level');
    return LEVELS.includes(l) ? l : 'intermediate';
  }, [location.search]);

  const [level, setLevel] = useState(initialLevel);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 챕터 인덱스 기반 상태
  const [activeIdx, setActiveIdx] = useState(0);
  const [readIdxs, setReadIdxs] = useState(() => new Set([0])); // 첫 챕터는 기본 열림

  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('gotroot_theme') === 'dark'; } catch { return false; }
  });
  const toggleTheme = () => {
    setIsDark(v => {
      try { localStorage.setItem('gotroot_theme', !v ? 'dark' : 'light'); } catch {}
      return !v;
    });
  };

  // 콘텐츠 로드
  useEffect(() => {
    const loader = CONTENT_LOADERS[campaignId];
    if (!loader) {
      setError('이 캠페인의 학습 콘텐츠가 아직 준비되지 않았습니다');
      setLoading(false);
      return;
    }
    setLoading(true);
    loader()
      .then(mod => {
        setContent(mod);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || '콘텐츠 로딩 실패');
        setLoading(false);
      });
  }, [campaignId]);

  // 레벨 변경 시 URL 쿼리 동기화 + 진행률 리셋
  const changeLevel = (l) => {
    setLevel(l);
    setActiveIdx(0);
    setReadIdxs(new Set([0]));
    const qs = new URLSearchParams();
    qs.set('level', l);
    navigate(`${location.pathname}?${qs.toString()}`, { replace: true });
  };

  // 챕터 점프 (스크롤 상단)
  const jumpTo = (i) => {
    setActiveIdx(i);
    setReadIdxs(prev => new Set([...prev, i]));
    if (typeof window !== 'undefined') {
      // 상위 스크롤 컨테이너 대신 현재 챕터 섹션으로 스크롤
      const el = document.getElementById(`chapter-section-${i}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 다음 챕터로 넘어가기
  const goNext = () => {
    if (!content) return;
    const chapters = content.CHAPTERS || [];
    const nextIdx = chapters.findIndex((c, i) => i > activeIdx && c.ready);
    if (nextIdx >= 0) jumpTo(nextIdx);
    else {
      // 모든 풀콘텐츠 챕터를 다 읽음 → 체크포인트로
      const quizEl = document.getElementById('final-checkpoint');
      if (quizEl) quizEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 로딩/에러
  if (loading) {
    return (
      <PageWrapper isDark={isDark} toggleTheme={toggleTheme} onClose={() => navigate(`/apt/${campaignId}`)}>
        <div className={`p-8 text-center ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent mb-3"></div>
          <p className="text-sm">학습 콘텐츠 로딩 중…</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !content) {
    return (
      <PageWrapper isDark={isDark} toggleTheme={toggleTheme} onClose={() => navigate(`/apt/${campaignId}`)}>
        <div className={`p-8 text-center ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          <p className="text-5xl mb-3">🚧</p>
          <p className="font-semibold mb-2">학습 콘텐츠 준비 중</p>
          <p className={`text-xs font-mono mb-4 ${isDark ? 'text-[#888]' : 'text-[#999]'}`}>{error}</p>
          <p className={`text-xs mb-4 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
            MVP는 <b>SolarWinds (C0024)</b> intermediate 레벨만 풀 콘텐츠로 제공됩니다.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate(`/apt/${campaignId}`)}
              className={`text-sm font-semibold px-4 py-2 rounded-lg ${
                isDark ? 'bg-[#2d2d2d] hover:bg-[#333] text-white' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a]'
              }`}
            >
              ← 상세로
            </button>
            <button
              onClick={() => navigate('/apt/C0024/study?level=intermediate')}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              SolarWinds 프로토타입 보러가기 →
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const { META, CHAPTERS = [], FINAL_QUIZ = [], GLOSSARY = [] } = content;
  const availableLevels = META.availableLevels || ['intermediate'];
  const levelMeta = LEVEL_META[level];
  const levelReady = availableLevels.includes(level);

  const readyChapters = CHAPTERS.filter(c => c.ready);
  const readReadyCount = [...readIdxs].filter(i => CHAPTERS[i]?.ready).length;
  const activeChapter = CHAPTERS[activeIdx];

  return (
    <PageWrapper
      isDark={isDark}
      toggleTheme={toggleTheme}
      onClose={() => navigate(`/apt/${campaignId}`)}
      title={`${META.campaignId}_study.app`}
    >
      <div className={`p-5 md:p-7 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {/* 헤더 */}
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isDark ? 'bg-[#1a1a1a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'}`}>
              {META.campaignId}
            </span>
            <span
              className="text-xs font-bold px-3 py-0.5 rounded-full"
              style={{ backgroundColor: levelMeta.color + '22', color: levelMeta.color }}
            >
              {levelMeta.emoji} {levelMeta.ko}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
              ⏱️ 총 ~{META.totalEstimatedMin}분 · {CHAPTERS.length}챕터
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
              title="Ch1-3 풀콘텐츠 + Ch4-10 skeleton"
            >
              MVP 3/10
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">{META.title}</h1>
          {META.subtitle && (
            <p className={`text-xs md:text-sm leading-relaxed mb-3 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
              {META.subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className={`text-[10px] uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#888]' : 'text-[#999]'}`}>
                난이도 선택
              </div>
              <LevelPicker
                currentLevel={level}
                availableLevels={availableLevels}
                onChange={changeLevel}
                isDark={isDark}
              />
            </div>
            {levelReady && readyChapters.length > 0 && (
              <div className="w-full sm:w-64">
                <ProgressBar
                  current={readReadyCount}
                  total={readyChapters.length}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        </div>

        {/* 레벨 준비 안됨 */}
        {!levelReady ? (
          <NotReadyPanel
            currentLevel={level}
            availableLevels={availableLevels}
            onSwitch={changeLevel}
            isDark={isDark}
          />
        ) : (
          <>
            {/* 챕터 목차 내비 */}
            <ChapterNav
              chapters={CHAPTERS}
              activeIdx={activeIdx}
              readIdxs={readIdxs}
              onJump={jumpTo}
              isDark={isDark}
            />

            {/* 현재 챕터 본문 */}
            {activeChapter && activeChapter.ready ? (
              <section
                id={`chapter-section-${activeIdx}`}
                className={`rounded-lg p-5 md:p-6 ${
                  isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-[#e5e5e5] shadow-sm'
                }`}
              >
                <Study.ChapterHeader
                  num={activeChapter.num}
                  total={CHAPTERS.length}
                  title={activeChapter.title}
                  subtitle={activeChapter.subtitle}
                  estMin={activeChapter.estMin}
                  isDark={isDark}
                />
                <div>{activeChapter.render({ isDark, C: Study })}</div>

                {/* 챕터 풋터: 이전/다음 */}
                <Study.ChapterFooter
                  isDark={isDark}
                  onPrev={activeIdx > 0 ? () => jumpTo(activeIdx - 1) : null}
                  prevTitle={activeIdx > 0 ? `Ch${CHAPTERS[activeIdx - 1].num}` : null}
                  onNext={goNext}
                  nextTitle={(() => {
                    const next = CHAPTERS.slice(activeIdx + 1).find(c => c.ready);
                    return next ? `Ch${next.num} ${next.title.split(' — ')[0]}` : '종합 체크포인트';
                  })()}
                  showComplete={!CHAPTERS.slice(activeIdx + 1).find(c => c.ready)}
                />
              </section>
            ) : (
              // skeleton 챕터가 선택된 경우
              <section
                id={`chapter-section-${activeIdx}`}
                className={`rounded-lg p-5 ${isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-[#e5e5e5]'}`}
              >
                <Study.NotReadyChapter
                  num={activeChapter?.num}
                  title={activeChapter?.title}
                  estMin={activeChapter?.estMin}
                  bullets={activeChapter?.bullets || []}
                  isDark={isDark}
                />
              </section>
            )}

            {/* 앞으로 이어질 챕터 프리뷰 (skeleton 리스트) */}
            <div className="mt-6">
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
                🚧 곧 오픈될 챕터 ({CHAPTERS.filter(c => !c.ready).length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHAPTERS.filter(c => !c.ready).map((c) => (
                  <Study.NotReadyChapter
                    key={c.id}
                    num={c.num}
                    title={c.title}
                    estMin={c.estMin}
                    bullets={c.bullets || []}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>

            {/* 종합 체크포인트 — Ch1-3 모두 읽은 뒤 노출 */}
            {readReadyCount >= readyChapters.length && readyChapters.length > 0 && (
              <div id="final-checkpoint" className="mt-8">
                <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                  🏁 종합 체크포인트 (Ch1~3 범위)
                </h2>
                <p className={`text-xs mb-3 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
                  전체 10챕터 오픈 후에는 20문제 심화 평가 + 수료증으로 확장됩니다.
                </p>
                <Study.MiniQuiz title={`5문제 — ${META.campaignId} 프리뷰`} questions={FINAL_QUIZ} isDark={isDark} />
              </div>
            )}

            {/* 용어 사전 */}
            <Glossary items={GLOSSARY} isDark={isDark} />

            {/* 하단 네비 */}
            <div className="flex flex-wrap gap-3 pt-4 border-t mt-6" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
              <button
                onClick={() => navigate(`/apt/${campaignId}`)}
                className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${
                  isDark ? 'bg-[#2d2d2d] hover:bg-[#333] text-white' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a]'
                }`}
              >
                ← 캠페인 상세로
              </button>
              <button
                onClick={() => navigate('/apt')}
                className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${
                  isDark ? 'bg-[#2d2d2d] hover:bg-[#333] text-white' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a]'
                }`}
              >
                갤러리로
              </button>
              <a
                href={`https://attack.mitre.org/campaigns/${META.campaignId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                MITRE 원문 ↗
              </a>
            </div>

            <div className={`mt-6 pt-4 border-t text-[11px] text-center ${isDark ? 'border-[#333] text-[#666]' : 'border-[#e5e5e5] text-[#999]'}`}>
              MVP 프로토타입 · Ch1-3 풀콘텐츠, Ch4-10은 톤 승인 후 단계적 확장
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
