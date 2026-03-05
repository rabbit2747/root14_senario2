import { motion } from 'framer-motion';
import { TACTIC_COLORS, HERO_TEXT } from './incidentData';

export default function TacticColumn({ tactic, isActiveTactic, language = 'ko', isDark = false, children }) {
  const colors = TACTIC_COLORS[tactic.id];
  const ht = HERO_TEXT[language] || HERO_TEXT.ko;

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      {/* 전술 헤더 — 글래스 상단 */}
      <div className={`${colors.bg} rounded-t-[16px] px-2.5 py-2 md:px-3 md:py-2.5`}>
        <h3 className="text-[10px] md:text-xs font-bold text-white tracking-wide leading-tight">
          {tactic.title}
        </h3>
        {language === 'ko' && (
          <p className="text-[8px] md:text-[9px] text-white/70 mt-0.5">
            {tactic.titleKo}
          </p>
        )}
      </div>

      {/* 카드 컨테이너 — 글래스 모피즘 */}
      <div
        className={`rounded-b-[16px] p-2.5 flex flex-col gap-2.5 min-h-[180px] md:min-h-[300px] border border-t-0 backdrop-blur-md
          ${isDark
            ? 'bg-slate-900/40 border-slate-700/30'
            : 'bg-white/30 border-white/50'}
        `}
        style={{
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.06)',
        }}
      >
        {/* Technique ID 라벨 */}
        <div className="px-0.5">
          <span className={`text-[8px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {ht.techniqueId}
          </span>
        </div>

        {/* 카드 목록 */}
        <div className="flex flex-col gap-2">
          {children}
        </div>

        {/* 활성 전술 하단 인디케이터 */}
        {isActiveTactic && (
          <motion.div
            className={`h-0.5 ${colors.bg} rounded-full`}
            layoutId="tacticIndicator"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        )}
      </div>
    </motion.div>
  );
}
