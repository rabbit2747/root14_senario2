import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAttackSimulatorData from '../../hooks/useAttackSimulatorData';
import NetworkTopologyDiagram from './NetworkTopologyDiagram';
import PhaseStepperBar from './PhaseStepperBar';
import PhaseDetailPanel from './PhaseDetailPanel';
import { ChevronLeft, ChevronRight, ChevronUp, GameConsole } from '@carbon/icons-react';

const COLLAPSE_KEY = 'gotroot_sim_collapsed';

/**
 * AttackSimulatorWidget — 인터랙티브 공격 시뮬레이터 메인 컨테이너
 *
 * @param {{ subTechniqueId: string, embedded?: boolean, onComplete?: () => void }} props
 *   - embedded: true이면 자체 헤더/접기 숨김 (AnimationLab 내 사용)
 *   - onComplete: 마지막 페이즈에서 호출되는 콜백
 */
export default function AttackSimulatorWidget({ subTechniqueId, embedded = false, onComplete }) {
  const { data, loading } = useAttackSimulatorData(subTechniqueId);

  const [currentPhase, setCurrentPhase] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (embedded) return false; // embedded 모드에서는 항상 펼침
    try {
      return localStorage.getItem(COLLAPSE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const skipRef = useRef(null);

  // 접기/펼치기 토글
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // 페이즈 이동
  const goPhase = useCallback((id) => {
    setCurrentPhase(id);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentPhase(prev => Math.max(1, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    if (!data?.phases?.length) return;
    const max = data.phases.length;
    setCurrentPhase(prev => {
      if (prev >= max) {
        // 마지막 페이즈에서 다음 클릭 → 완료 콜백
        if (onComplete) onComplete();
        return prev;
      }
      return prev + 1;
    });
  }, [data?.phases?.length, onComplete]);

  // 스킵: 아래 레벨 카드로 스크롤 (CourseSelector 모드 전용)
  const handleSkip = useCallback(() => {
    const el = skipRef.current?.closest('[data-simulator-parent]')?.nextElementSibling;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // 로딩 중이거나 데이터 없으면 미표시
  if (loading || !data?.phases?.length) return null;

  const phases = data.phases;
  const currentPhaseData = phases.find(p => p.id === currentPhase) || phases[0];
  const totalPhases = phases.length;
  const isLastPhase = currentPhase >= totalPhases;

  // ── 시뮬레이터 본문 (공통) ──
  const simulatorBody = (
    <div className={embedded ? 'flex flex-col gap-4' : 'px-4 sm:px-5 py-4 flex flex-col gap-4'}>
      {/* 페이즈 스텝바 */}
      <PhaseStepperBar
        phases={phases}
        currentPhase={currentPhase}
        onPhaseClick={goPhase}
      />

      {/* 네트워크 토폴로지 */}
      <NetworkTopologyDiagram
        topology={data.topology}
        currentPhase={currentPhase}
        activeNodes={currentPhaseData.activeNodes || []}
      />

      {/* 페이즈 상세 */}
      <PhaseDetailPanel
        phase={currentPhaseData}
        glossary={data.glossary}
      />

      {/* ── 네비게이션 바 ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        {/* 이전 */}
        <button
          onClick={goPrev}
          disabled={currentPhase <= 1}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
            ${currentPhase <= 1
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
        >
          <ChevronLeft size={14} /> 이전
        </button>

        {/* 도트 인디케이터 */}
        <div className="flex items-center gap-1.5">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => goPhase(p.id)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300 cursor-pointer
                ${p.id === currentPhase
                  ? 'bg-blue-400 w-5 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
                  : p.id < currentPhase
                    ? 'bg-emerald-500/60 hover:bg-emerald-400'
                    : 'bg-slate-600 hover:bg-slate-400'
                }
              `}
              title={p.title}
            />
          ))}
        </div>

        {/* 다음 / 완료 */}
        {embedded && isLastPhase ? (
          <button
            onClick={() => onComplete?.()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          >
            완료 ✓
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!embedded && isLastPhase}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
              ${(!embedded && isLastPhase)
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
          >
            다음 <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* 교육 바로 시작 스킵 (embedded 모드에서 숨김) */}
      {!embedded && (
        <div className="flex justify-center pb-1">
          <button
            onClick={handleSkip}
            className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors cursor-pointer underline underline-offset-2"
          >
            교육 바로 시작 →
          </button>
        </div>
      )}
    </div>
  );

  // ── embedded 모드: 외부 컨테이너/헤더 없이 본문만 ──
  if (embedded) {
    return (
      <div ref={skipRef} className="w-full">
        {simulatorBody}
      </div>
    );
  }

  // ── 일반 모드: 헤더 + 접기/펼치기 컨테이너 ──
  return (
    <div ref={skipRef} data-simulator-parent="" className="w-full">
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        {/* ── 헤더 ── */}
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 cursor-pointer hover:from-slate-700/80 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <GameConsole size={20} />
            <span className="text-sm font-black text-slate-200 tracking-tight">
              공격 시뮬레이터
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {data.subTechniqueId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold">
              {currentPhase}/{totalPhases}
            </span>
            <span className={`text-slate-400 text-sm transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
              <ChevronUp size={12} />
            </span>
          </div>
        </button>

        {/* ── 본문 (접기/펼치기) ── */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {simulatorBody}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
