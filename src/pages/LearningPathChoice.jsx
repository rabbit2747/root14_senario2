import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eduMeta from '../data/edu-meta.json';
import matrixFallback from '../data/matrix-fallback.json';

// ── 14 택틱 메타 (이모지 + 색상 + 한/영 이름) ──
const TACTIC_META = {
  t1:  { emoji: '🔍', color: 'slate',  ko: '정찰',           en: 'Reconnaissance' },
  t2:  { emoji: '🛠️', color: 'amber',  ko: '자원 개발',      en: 'Resource Development' },
  t3:  { emoji: '🚪', color: 'red',    ko: '초기 접근',      en: 'Initial Access' },
  t4:  { emoji: '⚡', color: 'orange', ko: '실행',           en: 'Execution' },
  t5:  { emoji: '🔗', color: 'yellow', ko: '지속성',         en: 'Persistence' },
  t6:  { emoji: '⬆️', color: 'purple', ko: '권한 상승',      en: 'Privilege Escalation' },
  t7:  { emoji: '🛡️', color: 'green',  ko: '방어 회피',      en: 'Defense Evasion' },
  t8:  { emoji: '🔑', color: 'pink',   ko: '자격 증명 접근', en: 'Credential Access' },
  t9:  { emoji: '🔎', color: 'cyan',   ko: '탐색',           en: 'Discovery' },
  t10: { emoji: '↔️', color: 'indigo', ko: '측면 이동',      en: 'Lateral Movement' },
  t11: { emoji: '📦', color: 'teal',   ko: '수집',           en: 'Collection' },
  t12: { emoji: '📡', color: 'blue',   ko: 'C2 (명령 및 제어)', en: 'Command & Control' },
  t13: { emoji: '📤', color: 'rose',   ko: '유출',           en: 'Exfiltration' },
  t14: { emoji: '💥', color: 'red',    ko: '영향',           en: 'Impact' },
};

// 택틱 색상 → Tailwind 클래스 매핑
const COLOR_MAP = {
  slate:  { bg: 'bg-slate-50 dark:bg-slate-900/20',   border: 'border-slate-200 dark:border-slate-700',   text: 'text-slate-700 dark:text-slate-300',   badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800/30', text: 'text-amber-700 dark:text-amber-300',   badge: 'bg-amber-200 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300' },
  red:    { bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800/30',     text: 'text-red-700 dark:text-red-300',       badge: 'bg-red-200 dark:bg-red-800/40 text-red-800 dark:text-red-300' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800/30', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-200 dark:bg-orange-800/40 text-orange-800 dark:text-orange-300' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800/30', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-200 dark:bg-yellow-800/40 text-yellow-800 dark:text-yellow-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800/30', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-200 dark:bg-purple-800/40 text-purple-800 dark:text-purple-300' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/30', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-200 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-300' },
  pink:   { bg: 'bg-pink-50 dark:bg-pink-900/20',     border: 'border-pink-200 dark:border-pink-800/30',   text: 'text-pink-700 dark:text-pink-300',     badge: 'bg-pink-200 dark:bg-pink-800/40 text-pink-800 dark:text-pink-300' },
  cyan:   { bg: 'bg-cyan-50 dark:bg-cyan-900/20',     border: 'border-cyan-200 dark:border-cyan-800/30',   text: 'text-cyan-700 dark:text-cyan-300',     badge: 'bg-cyan-200 dark:bg-cyan-800/40 text-cyan-800 dark:text-cyan-300' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800/30', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-200 dark:bg-indigo-800/40 text-indigo-800 dark:text-indigo-300' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',     border: 'border-teal-200 dark:border-teal-800/30',   text: 'text-teal-700 dark:text-teal-300',     badge: 'bg-teal-200 dark:bg-teal-800/40 text-teal-800 dark:text-teal-300' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-200 dark:border-blue-800/30',   text: 'text-blue-700 dark:text-blue-300',     badge: 'bg-blue-200 dark:bg-blue-800/40 text-blue-800 dark:text-blue-300' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-900/20',     border: 'border-rose-200 dark:border-rose-800/30',   text: 'text-rose-700 dark:text-rose-300',     badge: 'bg-rose-200 dark:bg-rose-800/40 text-rose-800 dark:text-rose-300' },
};

// ── edu-meta에서 택틱별 beginner 기법 그룹화 ──
function buildTacticTechMap() {
  const pages = eduMeta.pages || eduMeta;
  const map = {}; // tacticId → [{ id, title, difficulty }]
  for (const [tid, info] of Object.entries(pages)) {
    const hasBeginnerUrl = info.levels?.beginner?.url;
    if (!hasBeginnerUrl) continue;
    for (const tacId of (info.tacticIds || [])) {
      if (!map[tacId]) map[tacId] = [];
      // 중복 방지 (한 기법이 여러 택틱에 속할 수 있음)
      if (!map[tacId].find(t => t.id === tid)) {
        map[tacId].push({ id: tid, title: info.title || '', titleEn: info.titleEn || '', difficulty: info.difficulty || 'beginner' });
      }
    }
  }
  return map;
}

// ── macOS 윈도우 래퍼 (LevelTest PageWrapper와 동일) ──
function PageWrapper({ children, isDark, toggleTheme }) {
  return (
    <div className={`min-h-[100dvh] flex flex-col justify-center items-center transition-colors duration-300 overflow-hidden ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#F4F1EA]'}`}>
      <div className={`w-[95%] max-w-[850px] max-h-[90dvh] flex flex-col rounded-xl z-10 transition-all duration-300 ${isDark ? 'bg-[#242424] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]' : 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]'}`}>
        {/* 타이틀바 */}
        <div className={`h-12 flex-shrink-0 flex items-center px-5 relative border-b rounded-t-xl ${isDark ? 'bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] border-[#111]' : 'bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1]'}`}>
          <div className="flex gap-2">
            <div className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className={`absolute w-full text-center left-0 text-sm font-semibold pointer-events-none ${isDark ? 'text-[#a1a1aa]' : 'text-[#4d4d4d]'}`}>
            Learning_Path.app
          </div>
          <button onClick={toggleTheme} className="ml-auto z-10 relative text-gray-500 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-200 transition-colors" title="다크 모드 전환">
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.32a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.415l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.32 4.22a1 1 0 010 1.415l-.707.708a1 1 0 01-1.415-1.414l.708-.708a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-1.32a1 1 0 01-1.415 0l-.708-.707a1 1 0 011.414-1.415l.708.708a1 1 0 010 1.414zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm1.32-4.22a1 1 0 010-1.415l.707-.708a1 1 0 011.415 1.414l-.708.708a1 1 0 01-1.414 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
        </div>
        {/* 콘텐츠 영역 */}
        <div className="p-[20px_16px] sm:p-[40px_50px] min-h-[450px] sm:min-h-[550px] overflow-y-auto flex flex-col relative">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── 뒤로가기 버튼 ──
function BackButton({ onClick, label, isDark }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 mb-5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-400' : 'border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-500'}`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      {label}
    </button>
  );
}

// ── Phase: 메인 선택 ──
function ChoicePhase({ onSelect, isDark }) {
  return (
    <div className="flex-1 flex flex-col" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="text-center mb-8">
        <h2 className={`text-2xl md:text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
          어떤 방식으로 학습하시겠습니까?
        </h2>
        <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          나에게 맞는 학습 방식을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 flex-1">
        {/* 추천 학습 카드 */}
        <button
          onClick={() => onSelect('recommended')}
          className={`group text-left p-6 sm:p-7 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isDark
            ? 'border-blue-800/40 bg-blue-900/15 hover:border-blue-600/60 hover:bg-blue-900/25'
            : 'border-blue-200 bg-blue-50/60 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="text-4xl mb-4">🎯</div>
          <h3 className={`text-lg sm:text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
            ROOT14 추천 학습
          </h3>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            전술(Tactic)별로 추천하는 기법을 단계별로 학습합니다.
            <br />
            <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>초보자에게 추천!</span>
          </p>
          <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            시작하기
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>

        {/* 자율학습 카드 */}
        <button
          onClick={() => onSelect('self-directed')}
          className={`group text-left p-6 sm:p-7 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isDark
            ? 'border-emerald-800/40 bg-emerald-900/15 hover:border-emerald-600/60 hover:bg-emerald-900/25'
            : 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-400 hover:bg-emerald-50'
          }`}
        >
          <div className="text-4xl mb-4">📚</div>
          <h3 className={`text-lg sm:text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
            자율학습
          </h3>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            IT 기초 또는 MITRE ATT&CK 매트릭스에서 자유롭게 탐색합니다.
            <br />
            <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>내 페이스대로!</span>
          </p>
          <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            선택하기
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Phase: 추천 택틱 그리드 ──
function RecommendedPhase({ onSelectTactic, onBack, tacticTechMap, isDark }) {
  // 기법이 있는 택틱만 표시
  const tacticIds = Object.keys(TACTIC_META).filter(id => tacticTechMap[id]?.length > 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <BackButton onClick={onBack} label="돌아가기" isDark={isDark} />

      <div className="text-center mb-6">
        <h2 className={`text-xl md:text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
          학습할 전술을 선택하세요
        </h2>
        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          MITRE ATT&CK의 14개 전술 중 관심 분야를 골라보세요
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tacticIds.map(id => {
          const meta = TACTIC_META[id];
          const colors = COLOR_MAP[meta.color] || COLOR_MAP.slate;
          const techCount = tacticTechMap[id]?.length || 0;

          return (
            <button
              key={id}
              onClick={() => onSelectTactic(id)}
              className={`group text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${colors.bg} ${colors.border}`}
            >
              <div className="text-2xl sm:text-3xl mb-2">{meta.emoji}</div>
              <div className={`text-sm sm:text-[15px] font-bold leading-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {meta.ko}
              </div>
              <div className={`text-[10px] sm:text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {meta.en}
              </div>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                {techCount}개 기법
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Phase: 택틱 상세 (서브테크닉 목록) ──
function TacticDetailPhase({ tacticId, tacticTechMap, onBack, onSelectTech, isDark }) {
  const [showAll, setShowAll] = useState(false);
  const meta = TACTIC_META[tacticId];
  const colors = COLOR_MAP[meta?.color] || COLOR_MAP.slate;
  const techs = tacticTechMap[tacticId] || [];
  const INITIAL_SHOW = 6;
  const visibleTechs = showAll ? techs : techs.slice(0, INITIAL_SHOW);

  const diffBadge = (diff) => {
    const map = {
      beginner:     { label: '초급', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      intermediate: { label: '중급', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      advanced:     { label: '고급', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    const d = map[diff] || map.beginner;
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.cls}`}>{d.label}</span>;
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <BackButton onClick={onBack} label="택틱 목록" isDark={isDark} />

      {/* 택틱 헤더 */}
      <div className={`flex items-center gap-3 mb-6 p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
        <span className="text-3xl">{meta?.emoji}</span>
        <div>
          <h2 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>{meta?.ko}</h2>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{meta?.en}</p>
        </div>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>
          {techs.length}개
        </span>
      </div>

      {/* 서브테크닉 리스트 */}
      <div className="space-y-2">
        {visibleTechs.map(tech => (
          <button
            key={tech.id}
            onClick={() => onSelectTech(tech.id)}
            className={`group w-full text-left flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${isDark
              ? 'border-gray-700 bg-[#2a2a2a] hover:border-gray-500 hover:bg-[#333]'
              : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
            }`}
          >
            <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black ${colors.bg} ${colors.text}`}>
              {tech.id.replace('T', '').split('.')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {tech.title}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{tech.id}</span>
                {diffBadge(tech.difficulty)}
              </div>
            </div>
            <svg className={`w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* 더보기 */}
      {techs.length > INITIAL_SHOW && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className={`w-full mt-3 py-3 text-sm font-bold rounded-xl border transition-all duration-200 hover:scale-[1.01] ${isDark
            ? 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500'
            : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-400'
          }`}
        >
          +{techs.length - INITIAL_SHOW}개 더보기
        </button>
      )}
    </div>
  );
}

// ── Phase: 자율학습 하위 선택 ──
function SelfDirectedPhase({ onBack, isDark, navigate }) {
  return (
    <div className="flex-1 flex flex-col" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <BackButton onClick={onBack} label="돌아가기" isDark={isDark} />

      <div className="text-center mb-8">
        <h2 className={`text-xl md:text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
          자율학습 방식을 선택하세요
        </h2>
        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          기초부터 차근차근, 또는 전체 매트릭스를 자유롭게 탐색하세요
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 flex-1">
        {/* IT 기초 */}
        <button
          onClick={() => navigate('/basics')}
          className={`group text-left p-6 sm:p-7 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isDark
            ? 'border-purple-800/40 bg-purple-900/15 hover:border-purple-600/60 hover:bg-purple-900/25'
            : 'border-purple-200 bg-purple-50/60 hover:border-purple-400 hover:bg-purple-50'
          }`}
        >
          <div className="text-4xl mb-4">📖</div>
          <h3 className={`text-lg sm:text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
            IT 기초 학습
          </h3>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            네트워크, 운영체제, 보안 기초부터
            <br />차근차근 배워보세요.
          </p>
          <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            기초 학습 시작
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>

        {/* Full Matrix */}
        <button
          onClick={() => navigate('/')}
          className={`group text-left p-6 sm:p-7 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isDark
            ? 'border-gray-700 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
            : 'border-gray-200 bg-gray-50/60 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className={`text-lg sm:text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
            Full Matrix
          </h3>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            MITRE ATT&CK 전체 매트릭스에서
            <br />자유롭게 기법을 탐색하세요.
          </p>
          <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            매트릭스 열기
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──
export default function LearningPathChoice() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState('choice');
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [isDark, setIsDark] = useState(false);

  // Auth Gate
  useEffect(() => {
    if (authLoading) return; // 세션 로딩 완료 대기
    if (!isLoggedIn) navigate('/login', { replace: true });
  }, [authLoading, isLoggedIn, navigate]);

  // 다크모드 감지
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('gotroot_dark', next ? 'true' : 'false'); } catch {}
  };

  // 택틱별 기법 맵 (메모이제이션)
  const tacticTechMap = useMemo(() => buildTacticTechMap(), []);

  // Phase 전환 핸들러
  const handleSelectTactic = (tacticId) => {
    setSelectedTactic(tacticId);
    setPhase('tactic-detail');
  };

  const handleSelectTech = (techniqueId) => {
    navigate(`/recommended/${techniqueId}`);
  };

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <PageWrapper isDark={isDark} toggleTheme={toggleTheme}>
        {phase === 'choice' && (
          <ChoicePhase
            onSelect={(p) => setPhase(p)}
            isDark={isDark}
          />
        )}

        {phase === 'recommended' && (
          <RecommendedPhase
            onSelectTactic={handleSelectTactic}
            onBack={() => setPhase('choice')}
            tacticTechMap={tacticTechMap}
            isDark={isDark}
          />
        )}

        {phase === 'tactic-detail' && selectedTactic && (
          <TacticDetailPhase
            tacticId={selectedTactic}
            tacticTechMap={tacticTechMap}
            onBack={() => setPhase('recommended')}
            onSelectTech={handleSelectTech}
            isDark={isDark}
          />
        )}

        {phase === 'self-directed' && (
          <SelfDirectedPhase
            onBack={() => setPhase('choice')}
            isDark={isDark}
            navigate={navigate}
          />
        )}
      </PageWrapper>
    </>
  );
}
