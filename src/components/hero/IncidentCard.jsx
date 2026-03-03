import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TACTIC_COLORS } from './incidentData';
import IncidentIllustration from './IncidentIllustration';

// 아이콘 매핑 (인라인 SVG)
const CardIcon = ({ type, size = 16 }) => {
  const icons = {
    film: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    terminal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    click: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
      </svg>
    ),
    key: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    explosion: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    code: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    network: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="6" /><rect x="16" y="16" width="6" height="6" /><rect x="2" y="16" width="6" height="6" />
        <path d="M5 16v-4h14v4" /><line x1="12" y1="12" x2="12" y2="8" />
      </svg>
    ),
  };
  return icons[type] || icons.shield;
};

// 카운트업 애니메이션 훅
function useCountUp(target, isActive, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevActive = useRef(false);

  useEffect(() => {
    if (!isActive) { setCount(0); prevActive.current = false; return; }
    if (prevActive.current) return;
    prevActive.current = true;

    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isActive, target, duration]);

  return count;
}

function formatNumber(n) {
  return n.toLocaleString();
}

export default function IncidentCard({
  incident,
  tacticId,
  isHighlighted,
  tourComplete,
  onClick,
  onMouseEnter,
  onMouseLeave,
  language = 'ko',
  isDark = false,
}) {
  const baseColors = TACTIC_COLORS[tacticId];
  const colors = isDark ? baseColors.dark : baseColors;
  const glowRgb = isDark ? baseColors.dark.glowRgb : baseColors.glowRgb;
  const colorHex = isDark ? baseColors.dark.hex : baseColors.hex;

  const statCount = useCountUp(
    incident.stat?.value || 0,
    isHighlighted,
    1400
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, rotateY: -90, transformPerspective: 800 }}
      animate={{
        opacity: isHighlighted ? 1 : tourComplete ? 0.92 : 0.35,
        rotateY: 0,
        scale: isHighlighted ? 1.06 : 1,
        transformPerspective: 800,
      }}
      transition={{
        opacity: { duration: 0.35 },
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        rotateY: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      onClick={() => onClick?.(incident)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative rounded-lg border-2 p-2.5 md:p-3 cursor-pointer select-none overflow-hidden
        transition-colors duration-200
        ${isHighlighted
          ? `${colors.light} ${colors.border}`
          : isDark
            ? 'bg-slate-800/80 border-slate-700/60'
            : 'bg-white/90 border-slate-200/70'}
      `}
      style={isHighlighted ? {
        boxShadow: `0 0 24px rgba(${glowRgb}, 0.45), 0 0 48px rgba(${glowRgb}, 0.15), 0 8px 24px rgba(0,0,0,${isDark ? '0.4' : '0.1'})`,
      } : {
        boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* 펄스 파동 */}
      <AnimatePresence>
        {isHighlighted && (
          <>
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              style={{ border: `2px solid rgba(${glowRgb}, 0.4)` }}
            />
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0.4, scale: 1 }}
              animate={{ opacity: 0, scale: 1.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              style={{ border: `1px solid rgba(${glowRgb}, 0.25)` }}
            />
          </>
        )}
      </AnimatePresence>

      {/* 스캔라인 효과 */}
      {isHighlighted && (
        <motion.div
          className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, rgba(${glowRgb}, 0.3), transparent)` }}
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* 카드 상단: 아이콘 + 사고명 */}
      <div className="relative z-10 flex items-start gap-2 mb-1.5">
        <motion.div
          className={`shrink-0 mt-0.5 ${isHighlighted ? colors.text : isDark ? 'text-slate-500' : 'text-slate-400'}`}
          animate={isHighlighted ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardIcon type={incident.icon} size={14} />
        </motion.div>
        <div className="min-w-0">
          <h4 className={`text-[11px] md:text-xs font-bold leading-tight truncate
            ${isHighlighted
              ? isDark ? 'text-slate-100' : 'text-slate-800'
              : isDark ? 'text-slate-400' : 'text-slate-600'}
          `}>
            {incident.name}
          </h4>
          {incident.year && (
            <span className={`text-[9px] font-mono ${isHighlighted ? colors.text : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              ({incident.year})
            </span>
          )}
        </div>
      </div>

      {/* 기술명 */}
      <p className={`relative z-10 text-[9px] md:text-[10px] leading-snug mb-1
        ${isHighlighted
          ? isDark ? 'text-slate-300' : 'text-slate-700'
          : isDark ? 'text-slate-600' : 'text-slate-400'}
      `}>
        {incident.technique}
      </p>

      {/* 기술 ID 뱃지 */}
      <div className={`relative z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-mono font-semibold
        ${isHighlighted
          ? `${colors.light} ${colors.text} border ${colors.border}`
          : isDark
            ? 'bg-slate-700/60 text-slate-500 border border-slate-600/50'
            : 'bg-slate-100 text-slate-400 border border-slate-200'}
      `}>
        {incident.techniqueId}
      </div>

      {/* SVG 일러스트레이션 (하이라이트 시) */}
      <AnimatePresence>
        {isHighlighted && (
          <IncidentIllustration
            incidentId={incident.id}
            color={colorHex}
            isActive={isHighlighted}
          />
        )}
      </AnimatePresence>

      {/* 위협 카운터 */}
      <AnimatePresence>
        {isHighlighted && incident.stat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="relative z-10 mt-2 pt-2 border-t border-dashed"
            style={{ borderColor: `rgba(${glowRgb}, 0.3)` }}
          >
            <div className="flex items-baseline gap-1">
              <span className={`text-lg md:text-xl font-black tabular-nums ${colors.text}`}>
                {formatNumber(statCount)}
              </span>
              <span className={`text-[10px] font-bold ${colors.text} opacity-70`}>
                {incident.stat.unit}
              </span>
            </div>
            <span className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {incident.stat.label[language] || incident.stat.label.ko}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 상세 설명 */}
      <AnimatePresence>
        {isHighlighted && incident.description && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`relative z-10 mt-1.5 text-[9px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {incident.description[language] || incident.description.ko}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
