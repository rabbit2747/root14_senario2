import { memo } from 'react';

/**
 * PhaseStepperBar — 페이즈 진행 타임라인
 * 수평 스텝 인디케이터 + 클릭으로 자유 탐색
 *
 * @param {{ phases: Array, currentPhase: number, onPhaseClick: (id: number) => void }} props
 */
function PhaseStepperBar({ phases, currentPhase, onPhaseClick }) {
  if (!phases?.length) return null;

  return (
    <div className="flex items-center w-full px-1 sm:px-2 py-2 overflow-x-auto scrollbar-hide">
      {phases.map((phase, idx) => {
        const isCurrent = phase.id === currentPhase;
        const isPassed = phase.id < currentPhase;
        const isLast = idx === phases.length - 1;

        return (
          <div key={phase.id} className="flex items-center flex-shrink-0" style={{ flex: isLast ? '0 0 auto' : '1 1 0' }}>
            {/* 스텝 버튼 */}
            <button
              onClick={() => onPhaseClick(phase.id)}
              className={`
                relative flex flex-col items-center gap-0.5 cursor-pointer
                transition-all duration-300 group min-w-[44px]
              `}
              title={phase.title}
            >
              {/* 아이콘 원 */}
              <div
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  text-sm sm:text-base transition-all duration-300 border-2
                  ${isCurrent
                    ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.4)] scale-110'
                    : isPassed
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-slate-600 bg-slate-800/50 group-hover:border-slate-400'
                  }
                `}
              >
                {isPassed ? (
                  <span className="text-emerald-400 text-xs font-bold">✓</span>
                ) : (
                  <span>{phase.icon}</span>
                )}
              </div>

              {/* 제목 — 모바일에서 숨김 */}
              <span
                className={`
                  hidden sm:block text-[9px] sm:text-[10px] font-bold tracking-tight
                  max-w-[72px] text-center leading-tight truncate
                  ${isCurrent ? 'text-blue-300' : isPassed ? 'text-emerald-400/70' : 'text-slate-500'}
                `}
              >
                {phase.title}
              </span>
            </button>

            {/* 연결선 */}
            {!isLast && (
              <div className="flex-1 h-[2px] mx-1 sm:mx-1.5 relative">
                <div
                  className={`
                    h-full rounded-full transition-all duration-500
                    ${isPassed ? 'bg-emerald-500/50' : 'bg-slate-700'}
                  `}
                />
                {/* 활성화 진행 애니메이션 */}
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/60 to-transparent rounded-full animate-pulse" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default memo(PhaseStepperBar);
