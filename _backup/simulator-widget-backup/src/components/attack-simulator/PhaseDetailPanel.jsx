import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimationStage from '../tactic-widgets/AnimationPresets';

/**
 * PhaseDetailPanel — 선택된 페이즈의 상세 설명 + 미니 애니메이션
 *
 * @param {{ phase: Object, glossary: Object }} props
 */
function PhaseDetailPanel({ phase, glossary = {} }) {
  const [showTech, setShowTech] = useState(false);

  if (!phase) return null;

  // 이 페이즈에 연결된 용어 키
  const glossaryKeys = phase.glossaryKeys || [];
  const relatedTerms = glossaryKeys
    .map(k => glossary[k])
    .filter(Boolean);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4"
      >
        {/* ── 헤더: MITRE ATT&CK 뱃지 + 제목 ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* MITRE Tactic 뱃지 */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">
              🎯 {phase.mitreTactic}
            </span>
            {/* Technique ID 뱃지 */}
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40">
              {phase.mitreId}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            <span className="mr-2">{phase.icon}</span>
            {phase.title}
            <span className="text-xs text-slate-500 font-normal ml-2">{phase.titleEn}</span>
          </h3>
        </div>

        {/* ── 메인: 설명 + 애니메이션 그리드 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌측: 설명 */}
          <div className="flex flex-col gap-3">
            {/* 쉬운 설명 */}
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
              <p className="text-sm text-slate-200 leading-relaxed">
                {phase.description}
              </p>
            </div>

            {/* 기술 상세 (토글) */}
            <button
              onClick={() => setShowTech(prev => !prev)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer self-start"
            >
              <span className="text-base">{showTech ? '▾' : '▸'}</span>
              기술 상세 보기
            </button>
            <AnimatePresence>
              {showTech && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-900/80 border border-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      {phase.technicalDetail}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 인라인 용어 카드 */}
            {relatedTerms.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  📖 관련 용어
                </span>
                {relatedTerms.map((term, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-200">{term.term}</span>
                      <span className="text-[9px] font-mono text-slate-500">{term.fullName}</span>
                    </div>
                    <span className="inline-block text-[10px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded mb-1.5 border border-blue-500/20">
                      {term.analogy}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {term.easyDesc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 우측: 미니 애니메이션 */}
          <div className="flex items-start">
            {phase.animation && (
              <div className="w-full">
                <AnimationStage preset={phase.animation} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(PhaseDetailPanel);
