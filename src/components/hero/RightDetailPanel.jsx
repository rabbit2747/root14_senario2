import { motion, AnimatePresence } from 'framer-motion';
import { TACTIC_COLORS, HERO_TEXT } from './incidentData';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Framer Motion Stagger Variants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const panelContainer = {
  hidden: { opacity: 0, x: 20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { delay: 0, staggerChildren: 0.05, duration: 0.2 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const panelItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { delay: 0, type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 심각도 뱃지 (자체 포함)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SeverityBadge({ severity, isDark }) {
  const styles = {
    critical: isDark
      ? 'bg-red-950/60 text-red-400 border-red-800/50'
      : 'bg-red-100 text-red-700 border-red-200',
    high: isDark
      ? 'bg-orange-950/60 text-orange-400 border-orange-800/50'
      : 'bg-orange-100 text-orange-700 border-orange-200',
    medium: isDark
      ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
      : 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold border
        ${styles[severity] || styles.medium}`}
    >
      {(severity || 'medium').toUpperCase()}
    </span>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RightDetailPanel
//
// Props:
//   activeCardData  — 현재 incident 객체 (name, year, techniqueId, technique, description, detailedInfo)
//   tacticId        — 전술 ID (TACTIC_COLORS 색상 연동)
//   isDark          — 다크모드 여부
//   language        — 언어 코드 ('ko' | 'en' | ...)
//   isPaused        — 투어 일시정지 여부 → 타이머 animationPlayState 제어
//   tourStep        — 현재 스텝 번호 → key로 사용해 타이머 재시작
//   onOpenModal     — "방어 스킬트리 분석" 버튼 클릭 콜백 () => void
//
// 통합 예시 (HeroIncidentMatrix.jsx):
//   import RightDetailPanel from './RightDetailPanel';
//
//   <div className="hidden md:block shrink-0 w-52 self-start">
//     <RightDetailPanel
//       activeCardData={selectedIncident || currentIncidentObj}
//       tacticId={selectedTacticId || currentTourItem?.tacticId}
//       isDark={isDark}
//       language={language}
//       isPaused={isPaused}
//       tourStep={tourStep}
//       onOpenModal={() => setIsFullScreenModalOpen(true)}
//     />
//   </div>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function RightDetailPanel({
  activeCardData,
  tacticId,
  isDark = false,
  language = 'ko',
  isPaused = false,
  tourStep = 0,
  onOpenModal,
}) {
  const colors = TACTIC_COLORS[tacticId] || TACTIC_COLORS['initial-access'];
  const accentHex  = isDark ? colors.dark?.hex  : colors.hex;
  const accentText = isDark ? colors.dark?.text : colors.text;
  const ht  = HERO_TEXT[language] || HERO_TEXT.ko;
  const lang = language === 'ko' || language === 'en' ? language : 'en';

  const textMain  = isDark ? 'text-slate-200' : 'text-slate-700';
  const textSub   = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const divider   = isDark ? 'border-slate-700/50' : 'border-slate-200';

  return (
    // 래퍼 div — AnimatePresence 외부에 두어 외부 AnimatePresence와 충돌 방지
    <div className="w-full">
      <AnimatePresence mode="wait">
        {activeCardData && (
          <motion.div
            key={activeCardData.id}
            variants={panelContainer}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`relative rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.15)] overflow-hidden
              backdrop-blur-2xl glass-gradient-border border
              ${isDark
                ? 'bg-slate-900/90 border-slate-700/40'
                : 'bg-white/85 border-white/80'}
            `}
          >
            {/* ── 전술 색상 세로 바 ── */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]"
              style={{ background: accentHex }}
            />

            {/* ── 원형 타이머 (6초, isRunning 연동) ── */}
            <div
              className="absolute top-4 right-4 flex items-center justify-center"
              style={{ color: accentHex }}
            >
              <svg
                width="28" height="28" viewBox="0 0 32 32"
                className="transform -rotate-90 drop-shadow-sm"
              >
                {/* 트랙 */}
                <circle
                  cx="16" cy="16" r="14"
                  fill="none" stroke="currentColor"
                  strokeWidth="3" className="opacity-20"
                />
                {/* 진행 바 — key={tourStep}으로 스텝마다 재시작 */}
                <circle
                  key={tourStep}
                  cx="16" cy="16" r="14"
                  fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray="88" strokeDashoffset="88"
                  strokeLinecap="round"
                  className="anim-progress-circle"
                  style={{
                    // isPaused(isRunning) 에 따라 pause/running
                    animationPlayState: isPaused ? 'paused' : 'running',
                    // HERO_CSS의 STEP_DURATION(5s)과 별개로 패널은 6초
                    animationDuration: '6s',
                  }}
                />
              </svg>
            </div>

            {/* ── 패널 본문 ── */}
            <div className="pl-4 pr-4 py-4 space-y-2">

              {/* 헤더: techniqueId + severity + 이름 + 기술명 */}
              <motion.div variants={panelItem} className="pr-8">
                <div className="flex items-center gap-1 flex-wrap mb-1">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded
                    ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-700'}`}
                  >
                    {activeCardData.techniqueId}
                  </span>
                  {activeCardData.detailedInfo?.severity && (
                    <SeverityBadge
                      severity={activeCardData.detailedInfo.severity}
                      isDark={isDark}
                    />
                  )}
                </div>

                <h3 className={`text-[12px] font-extrabold leading-tight ${textMain}`}>
                  {activeCardData.name}
                  {activeCardData.year && (
                    <span className={`font-normal ml-1 text-[10px] ${textMuted}`}>
                      ({activeCardData.year})
                    </span>
                  )}
                </h3>
                <p className={`text-[10px] mt-0.5 font-semibold ${accentText || textSub}`}>
                  {activeCardData.technique}
                </p>
              </motion.div>

              {/* 설명 */}
              <motion.div
                variants={panelItem}
                className={`pt-2 border-t ${divider}`}
              >
                <p className={`text-[10px] leading-relaxed ${textMain}`}>
                  {activeCardData.description?.[language] || activeCardData.description?.ko}
                </p>
              </motion.div>

              {/* 세부 내용 (detailedInfo가 있을 때) */}
              {activeCardData.detailedInfo && (
                <>
                  {activeCardData.detailedInfo.attackVector && (
                    <motion.div variants={panelItem}>
                      <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${textMuted}`}>
                        {ht.detailAttackVector || 'Attack Vector'}
                      </div>
                      <div className={`text-[9px] leading-relaxed ${textMain}`}>
                        {activeCardData.detailedInfo.attackVector[lang]
                          || activeCardData.detailedInfo.attackVector.ko}
                      </div>
                    </motion.div>
                  )}

                  {activeCardData.detailedInfo.affectedOrgs && (
                    <motion.div variants={panelItem}>
                      <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${textMuted}`}>
                        {ht.detailAffected || 'Affected'}
                      </div>
                      <div className={`text-[9px] leading-relaxed ${textMain}`}>
                        {activeCardData.detailedInfo.affectedOrgs[lang]
                          || activeCardData.detailedInfo.affectedOrgs.ko}
                      </div>
                    </motion.div>
                  )}

                  {activeCardData.detailedInfo.timeline && (
                    <motion.div variants={panelItem}>
                      <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${textMuted}`}>
                        {ht.detailTimeline || 'Timeline'}
                      </div>
                      <div className={`text-[9px] leading-relaxed font-mono ${textSub}`}>
                        {activeCardData.detailedInfo.timeline[lang]
                          || activeCardData.detailedInfo.timeline.ko}
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* ── 액션 버튼 ── */}
              <motion.div variants={panelItem} className={`pt-2 border-t ${divider}`}>
                <button
                  onClick={onOpenModal}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2
                    rounded-xl text-[10px] font-bold transition-all active:scale-95
                    ${isDark
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-700/50 hover:bg-blue-600/35 hover:text-blue-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:text-blue-800'}
                  `}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  클릭하면 방어 스킬트리 분석
                </button>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
