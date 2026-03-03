import { motion } from 'framer-motion';
import { TACTIC_COLORS, HERO_TEXT } from './incidentData';

export default function TacticColumn({ tactic, isActiveTactic, language = 'ko', isDark = false, children }) {
  const colors = TACTIC_COLORS[tactic.id];
  const ht = HERO_TEXT[language] || HERO_TEXT.ko;

  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      {/* 전술 헤더 */}
      <div className={`${colors.bg} rounded-t-lg px-2 py-1.5 md:px-3 md:py-2`}>
        <h3 className="text-[10px] md:text-xs font-bold text-white tracking-wide leading-tight">
          {tactic.title}
        </h3>
        <p className="text-[8px] md:text-[9px] text-white/70 mt-0.5">
          {tactic.titleKo}
        </p>
      </div>

      {/* Technique ID 라벨 */}
      <div className="px-2 -mt-1">
        <span className={`text-[8px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          {ht.techniqueId}
        </span>
      </div>

      {/* 카드 컨테이너 */}
      <div className="flex flex-col gap-2 px-0.5">
        {children}
      </div>

      {/* 활성 전술 하단 인디케이터 */}
      {isActiveTactic && (
        <motion.div
          className={`h-0.5 ${colors.bg} rounded-full mx-2`}
          layoutId="tacticIndicator"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}
