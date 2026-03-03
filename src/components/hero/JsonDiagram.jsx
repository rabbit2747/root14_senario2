import { motion } from 'framer-motion';

export default function JsonDiagram({ isActive = false, isDark = false, className = '' }) {
  const cardBg = isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200';
  const textPrimary = isDark ? 'text-slate-300' : 'text-slate-600';
  const textSecondary = isDark ? 'text-slate-500' : 'text-slate-400';
  const codeBg = isDark ? 'text-slate-400' : 'text-slate-500';
  const miniBoxBg = isDark
    ? ['bg-blue-900/50 border-blue-700', 'bg-orange-900/50 border-orange-700', 'bg-emerald-900/50 border-emerald-700']
    : ['bg-blue-200 border-blue-300', 'bg-orange-200 border-orange-300', 'bg-emerald-200 border-emerald-300'];
  const jsonBox = isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-300';
  const arrowStroke = isDark ? '#64748b' : '#94a3b8';

  return (
    <motion.div
      className={`hidden lg:flex flex-col gap-3 ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      {/* JSON / TTPS 스택 */}
      <motion.div
        className={`backdrop-blur-sm rounded-lg border shadow-sm p-3 w-44 ${cardBg}`}
        animate={isActive ? { borderColor: isDark ? ['#334155', '#60a5fa', '#334155'] : ['#e2e8f0', '#3b82f6', '#e2e8f0'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className={`text-[10px] font-bold tracking-wider ${textPrimary}`}>JSON / TTPS</span>
        </div>
        <div className={`space-y-1 font-mono text-[9px] ${codeBg}`}>
          <div className="flex items-center gap-1">
            <span className={isDark ? 'text-blue-400' : 'text-blue-500'}>{'{'}</span>
            <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>"tactic"</span>
            <span>:</span>
          </div>
          <div className="pl-3 flex items-center gap-1">
            <span className={isDark ? 'text-orange-400' : 'text-orange-500'}>"Initial Access"</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={isDark ? 'text-blue-400' : 'text-blue-500'}>{'}'}</span>
          </div>
        </div>
      </motion.div>

      {/* Advanced JSON Structure */}
      <motion.div
        className={`backdrop-blur-sm rounded-lg border shadow-sm p-3 w-44 ${cardBg}`}
        animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className={`text-[9px] font-semibold ${textSecondary} mb-2`}>
          <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>Data-driven</span> Analysis
        </div>
        <div className={`text-[8px] ${textSecondary} mb-1.5`}>Advanced JSON Structure</div>
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col gap-1">
            {miniBoxBg.map((cls, i) => (
              <div key={i} className={`w-7 h-3 rounded-sm border ${cls}`} />
            ))}
          </div>
          <svg width="20" height="30" viewBox="0 0 20 30">
            <path d="M0 5 L10 15 L0 25" fill="none" stroke={arrowStroke} strokeWidth="1.5" />
            <path d="M10 15 L20 15" fill="none" stroke={arrowStroke} strokeWidth="1.5" />
          </svg>
          <div className="flex flex-col gap-1">
            <div className={`w-8 h-7 rounded-sm border flex items-center justify-center ${jsonBox}`}>
              <span className={`text-[7px] ${textSecondary}`}>JSON</span>
            </div>
          </div>
        </div>
        <div className={`mt-2 text-[8px] ${textSecondary} text-center`}>
          Expert-level Classification
        </div>
      </motion.div>
    </motion.div>
  );
}
