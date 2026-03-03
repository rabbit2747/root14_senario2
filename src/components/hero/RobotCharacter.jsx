import { motion } from 'framer-motion';

const waveVariants = {
  idle: { rotate: 0 },
  wave: {
    rotate: [0, -8, 8, -6, 6, 0],
    transition: { duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' },
  },
};

const eyeVariants = {
  idle: { scaleY: 1 },
  blink: {
    scaleY: [1, 0.1, 1],
    transition: { duration: 0.3, repeat: Infinity, repeatDelay: 4 },
  },
};

export default function RobotCharacter({ position = 'left', isActive = false, isDark = false, className = '' }) {
  const posClass = position === 'left'
    ? 'bottom-16 left-4 xl:left-8'
    : 'bottom-16 right-4 xl:right-8';

  const bodyFill = isDark ? '#1e293b' : '#e2e8f0';
  const bodyStroke = isDark ? '#475569' : '#94a3b8';
  const limbFill = isDark ? '#334155' : '#cbd5e1';
  const eyeBg = isDark ? '#0f172a' : 'white';
  const eyeStroke = isDark ? '#475569' : '#64748b';
  const mouthStroke = isDark ? '#475569' : '#64748b';
  const footFill = isDark ? '#475569' : '#94a3b8';

  return (
    <motion.div
      className={`hidden lg:block absolute ${posClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <motion.svg
        viewBox="0 0 120 150"
        width="72"
        height="90"
        xmlns="http://www.w3.org/2000/svg"
        variants={waveVariants}
        animate={isActive ? 'wave' : 'idle'}
        style={{ transformOrigin: '60px 75px' }}
      >
        {/* 안테나 */}
        <line x1="60" y1="8" x2="60" y2="28" stroke={bodyStroke} strokeWidth="2.5" strokeLinecap="round" />
        <motion.circle
          cx="60" cy="6" r="5"
          fill={isActive ? '#3b82f6' : bodyStroke}
          animate={isActive ? { opacity: [1, 0.4, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* 머리 */}
        <rect x="22" y="28" width="76" height="50" rx="14" fill={bodyFill} stroke={bodyStroke} strokeWidth="2" />

        {/* 눈 */}
        <motion.g variants={eyeVariants} animate="blink">
          <circle cx="42" cy="50" r="9" fill={eyeBg} stroke={eyeStroke} strokeWidth="1.5" />
          <circle cx="78" cy="50" r="9" fill={eyeBg} stroke={eyeStroke} strokeWidth="1.5" />
          <circle cx="44" cy="50" r="4.5" fill={isActive ? '#3b82f6' : isDark ? '#94a3b8' : '#475569'} />
          <circle cx="80" cy="50" r="4.5" fill={isActive ? '#3b82f6' : isDark ? '#94a3b8' : '#475569'} />
          <circle cx="46" cy="48" r="1.5" fill="white" opacity="0.8" />
          <circle cx="82" cy="48" r="1.5" fill="white" opacity="0.8" />
        </motion.g>

        {/* 입 */}
        <path d="M 44 64 Q 60 72 76 64" fill="none" stroke={mouthStroke} strokeWidth="2" strokeLinecap="round" />

        {/* 볼 */}
        <circle cx="32" cy="58" r="4" fill="#fca5a5" opacity={isDark ? '0.25' : '0.4'} />
        <circle cx="88" cy="58" r="4" fill="#fca5a5" opacity={isDark ? '0.25' : '0.4'} />

        {/* 몸통 */}
        <rect x="28" y="82" width="64" height="42" rx="10" fill={bodyFill} stroke={bodyStroke} strokeWidth="2" />
        <circle cx="50" cy="100" r="3" fill="#3b82f6" opacity="0.6" />
        <circle cx="60" cy="100" r="3" fill="#10b981" opacity="0.6" />
        <circle cx="70" cy="100" r="3" fill="#f97316" opacity="0.6" />

        {/* 팔 */}
        <motion.rect
          x="4" y="86" width="22" height="9" rx="4.5"
          fill={limbFill} stroke={bodyStroke} strokeWidth="1.5"
          animate={isActive ? { rotate: [0, -15, 15, 0], y: [0, -3, 3, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          style={{ transformOrigin: '22px 90px' }}
        />
        <motion.rect
          x="94" y="86" width="22" height="9" rx="4.5"
          fill={limbFill} stroke={bodyStroke} strokeWidth="1.5"
          animate={isActive ? { rotate: [0, 15, -15, 0], y: [0, -3, 3, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, delay: 0.3 }}
          style={{ transformOrigin: '94px 90px' }}
        />

        {/* 다리 */}
        <rect x="38" y="124" width="14" height="18" rx="5" fill={limbFill} stroke={bodyStroke} strokeWidth="1" />
        <rect x="68" y="124" width="14" height="18" rx="5" fill={limbFill} stroke={bodyStroke} strokeWidth="1" />
        <rect x="34" y="139" width="22" height="8" rx="4" fill={footFill} opacity="0.6" />
        <rect x="64" y="139" width="22" height="8" rx="4" fill={footFill} opacity="0.6" />
      </motion.svg>
    </motion.div>
  );
}
