import { motion, AnimatePresence, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';
import { TACTIC_COLORS, HERO_TEXT } from './incidentData';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Stagger Variants — panelSide 기반 동적 생성 (컴포넌트 내부에서 사용)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function makePanelContainerVariants(panelSide) {
  const inX  = panelSide === 'left' ? -20 : 20;
  const outX = panelSide === 'left' ?  20 : -20;
  return {
    hidden: { opacity: 0, x: inX },
    show: {
      opacity: 1,
      x: 0,
      transition: { delay: 0, staggerChildren: 0.1, duration: 0.3 },
    },
    exit: { opacity: 0, x: outX, transition: { duration: 0.2 } },
  };
}

const panelItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { delay: 0, type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 심각도 뱃지
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SeverityBadge({ severity, isDark }) {
  const styles = {
    critical: isDark ? 'bg-red-950/60 text-red-400 border-red-800/50' : 'bg-red-100 text-red-700 border-red-200',
    high:     isDark ? 'bg-orange-950/60 text-orange-400 border-orange-800/50' : 'bg-orange-100 text-orange-700 border-orange-200',
    medium:   isDark ? 'bg-amber-950/60 text-amber-400 border-amber-800/50' : 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold border
      ${styles[severity] || styles.medium}`}
    >
      {(severity || 'medium').toUpperCase()}
    </span>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DetailPanel
//
// Props:
//   isOpen           — 모바일 시트 열림 여부 (데스크탑은 activeCardData 유무로 자동 제어)
//   activeCardData   — { id, title, year, techniqueId, technique,
//                       detailDesc, severity, attackVector, affectedOrgs, timeline }
//   tacticId         — 전술 ID → TACTIC_COLORS 색상 연동
//   isDark           — 다크모드
//   language         — 언어 코드
//   onClose          — 모바일 시트 닫기 콜백
//   onOpenFullScreen — "전체 분석 리포트 보기" 버튼 콜백 → isFullScreenModalOpen = true
//
// 사용 예시 (HeroIncidentMatrix.jsx):
//   <DetailPanel
//     isOpen={isSheetOpen}
//     activeCardData={detailPanelData}
//     tacticId={selectedTacticId || currentTourItem?.tacticId}
//     isDark={isDark}
//     language={language}
//     onClose={() => setIsSheetOpen(false)}
//     onOpenFullScreen={() => setIsFullScreenModalOpen(true)}
//   />
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function DetailPanel({
  isOpen,
  activeCardData,
  tacticId,
  isDark = false,
  language = 'ko',
  onClose,
  onOpenFullScreen,
  panelSide = 'right',   // 'right' | 'left' — 동적 위치 조정
  isRunning = true,      // 원형 타이머 재생/일시정지 (false = hover 시 정지)
  timerKey = 0,          // 스텝 변경 시 타이머 CSS 애니메이션 리셋
}) {
  // panelSide 기반 동적 variants — 위치에 따라 슬라이드 방향 반전
  const containerVariants = makePanelContainerVariants(panelSide);

  const ht = HERO_TEXT[language] || HERO_TEXT.ko;
  const colors   = TACTIC_COLORS[tacticId] || TACTIC_COLORS['initial-access'];
  const accentHex  = isDark ? colors.dark?.hex  : colors.hex;
  const accentText = isDark ? colors.dark?.text : colors.text;

  // 모바일 드래그 값
  const dragY       = useMotionValue(0);
  const bgAlpha     = useTransform(dragY, [0, 300], [0.6, 0]);
  const blurRadius  = useTransform(dragY, [0, 300], [8, 0]);
  const backdropBg  = useMotionTemplate`rgba(0, 0, 0, ${bgAlpha})`;
  const backdropFilter = useMotionTemplate`blur(${blurRadius}px)`;

  // 테마별 텍스트 색상
  const textMain  = isDark ? 'text-slate-200'  : 'text-[#191F28]';
  const textSub   = isDark ? 'text-slate-400'  : 'text-[#4E5968]';
  const textMuted = isDark ? 'text-slate-500'  : 'text-slate-400';
  const divider   = isDark ? 'border-slate-700/50' : 'border-slate-200';

  return (
    <>
      {/* ══════════════════════════════════════════
          1. 데스크탑 — 동적 위치 플로팅 오버레이
             panelSide='right' → 우측 / 'left' → 좌측
             (activeCardData가 있을 때 자동 표시)
          ══════════════════════════════════════════ */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className={`hidden md:block absolute top-0 h-full w-[240px] lg:w-[270px] pointer-events-none z-40
          ${panelSide === 'left' ? 'left-0 lg:left-2' : 'right-0 lg:right-2'}
        `}
      >
        <div className="sticky top-4">
          <AnimatePresence mode="wait">
            {activeCardData && (
              <motion.div
                key={activeCardData.id}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className={`relative pointer-events-auto rounded-[24px] p-4 lg:p-5
                  shadow-[0_16px_40px_rgba(0,0,0,0.18)] glass-gradient-border border overflow-hidden
                  backdrop-blur-2xl
                  ${isDark
                    ? 'bg-slate-900/92 border-slate-700/40'
                    : 'bg-white/90 border-white/80'}
                `}
              >
                {/* 전술 색상 세로 바 */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]"
                  style={{ background: accentHex }}
                />

                <div className="pl-1.5 space-y-2.5">
                  {/* techniqueId + severity 뱃지 + 원형 타이머 */}
                  <motion.div variants={panelItem} className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded
                        ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-700'}`}
                      >
                        {activeCardData.techniqueId}
                      </span>
                      {activeCardData.severity && (
                        <SeverityBadge severity={activeCardData.severity} isDark={isDark} />
                      )}
                    </div>
                    {/* 원형 진행 타이머 (r=12, circumference≈75.4) */}
                    <div
                      className={`shrink-0 transition-opacity duration-300 ${isRunning ? 'opacity-100' : 'opacity-35'}`}
                      title={isRunning ? 'Tour running' : 'Paused (hover)'}
                    >
                      <svg width="26" height="26" viewBox="0 0 28 28" style={{ transform: 'rotate(-90deg)' }}>
                        {/* 배경 원 */}
                        <circle
                          cx="14" cy="14" r="12" fill="none"
                          stroke={isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.14)'}
                          strokeWidth="2.5"
                        />
                        {/* 진행 원: key={timerKey}로 스텝 변경 시 CSS 애니메이션 리셋 */}
                        <circle
                          key={timerKey}
                          cx="14" cy="14" r="12" fill="none"
                          stroke={accentHex || (isDark ? '#64748b' : '#94a3b8')}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="75.4"
                          className="anim-progress-circle"
                          style={{
                            strokeDashoffset: 75.4,
                            animationPlayState: isRunning ? 'running' : 'paused',
                          }}
                        />
                      </svg>
                    </div>
                  </motion.div>

                  {/* 제목 */}
                  <motion.h3
                    variants={panelItem}
                    className={`text-[13px] font-extrabold leading-tight ${textMain}`}
                  >
                    {activeCardData.title}
                    {activeCardData.year && (
                      <span className={`font-normal ml-1 text-[10px] ${textMuted}`}>
                        ({activeCardData.year})
                      </span>
                    )}
                  </motion.h3>

                  {/* 기술명 */}
                  <motion.p
                    variants={panelItem}
                    className={`text-[10px] font-semibold ${accentText || textSub}`}
                  >
                    {activeCardData.technique}
                  </motion.p>

                  {/* 설명 텍스트 */}
                  <motion.div
                    variants={panelItem}
                    className={`text-[10px] leading-relaxed pt-2 border-t ${divider}`}
                  >
                    <span className={textSub}>{activeCardData.detailDesc}</span>
                  </motion.div>

                  {/* 추가 정보 — attackVector */}
                  {activeCardData.attackVector && (
                    <motion.div variants={panelItem}>
                      <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${textMuted}`}>
                        Attack Vector
                      </div>
                      <p className={`text-[9px] leading-relaxed ${textMain}`}>
                        {activeCardData.attackVector}
                      </p>
                    </motion.div>
                  )}

                  {/* 액션 버튼 */}
                  <motion.div variants={panelItem} className={`pt-2 border-t ${divider}`}>
                    <motion.button
                      onClick={() => onOpenFullScreen?.()}
                      whileTap={{ scale: 0.96 }}
                      className={`relative overflow-hidden w-full flex items-center justify-center
                        gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all
                        ${isDark
                          ? 'bg-blue-600/25 text-blue-300 border border-blue-700/50 hover:bg-blue-600/40'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.3)]'}
                      `}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {ht.viewFullReport || '전체 분석 리포트 보기'}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          2. 모바일 — 하단 시트 (isOpen으로 제어)
             drag="y" 스와이프 다운으로 닫기
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && activeCardData && (
          <>
            {/* 백드롭 (동적 blur) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                backgroundColor: backdropBg,
                backdropFilter: backdropFilter,
                WebkitBackdropFilter: backdropFilter,
              }}
              className="fixed inset-0 z-[60] md:hidden"
              onClick={onClose}
            />

            {/* 시트 본체 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              style={{ y: dragY }}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
              className={`fixed bottom-0 left-0 w-full rounded-t-[32px] p-5 pt-4 z-[70]
                md:hidden shadow-[0_-8px_40px_rgba(0,0,0,0.2)] pb-10 max-h-[82vh]
                overflow-y-auto glass-gradient-border backdrop-blur-3xl
                ${isDark ? 'bg-slate-900/95 border-slate-700/40' : 'bg-white/95 border-white/60'}
              `}
            >
              {/* 드래그 핸들 */}
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-5 ${isDark ? 'bg-white/20' : 'bg-black/20'}`} />

              {/* 전술 색상 상단 선 */}
              <div className="w-full h-0.5 rounded-full mb-4" style={{ background: accentHex }} />

              {/* techniqueId + severity */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded
                  ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-700'}`}
                >
                  {activeCardData.techniqueId}
                </span>
                {activeCardData.severity && (
                  <SeverityBadge severity={activeCardData.severity} isDark={isDark} />
                )}
              </div>

              {/* 제목 */}
              <h3 className={`text-xl font-extrabold leading-tight mb-1 ${textMain}`}>
                {activeCardData.title}
                {activeCardData.year && (
                  <span className={`font-normal ml-1.5 text-sm ${textMuted}`}>({activeCardData.year})</span>
                )}
              </h3>
              <p className={`text-xs font-semibold mb-4 ${accentText || textSub}`}>
                {activeCardData.technique}
              </p>

              {/* 설명 텍스트 */}
              <div className={`text-sm leading-relaxed mb-4 pb-4 border-b ${divider}`}>
                <span className={textSub}>{activeCardData.detailDesc}</span>
              </div>

              {/* 추가 정보 — attackVector */}
              {activeCardData.attackVector && (
                <div className="mb-3">
                  <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
                    Attack Vector
                  </div>
                  <p className={`text-xs leading-relaxed ${textMain}`}>{activeCardData.attackVector}</p>
                </div>
              )}

              {/* 추가 정보 — affectedOrgs */}
              {activeCardData.affectedOrgs && (
                <div className="mb-4">
                  <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
                    Affected
                  </div>
                  <p className={`text-xs leading-relaxed ${textMain}`}>{activeCardData.affectedOrgs}</p>
                </div>
              )}

              {/* 액션 버튼 */}
              <motion.button
                onClick={() => onOpenFullScreen?.()}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full
                  font-bold text-sm transition-all
                  ${isDark
                    ? 'bg-blue-600/25 text-blue-300 border border-blue-700/50 hover:bg-blue-600/40'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.3)]'}
                `}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                전체 분석 리포트 보기
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}
