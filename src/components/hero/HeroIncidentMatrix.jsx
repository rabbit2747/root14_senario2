import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForwardFilled, ArrowRight } from '@carbon/icons-react';
import { storeLang } from '../LangToggle';
import { TACTICS, TOUR_SEQUENCE, TOTAL_TOUR_STEPS, HERO_TEXT, TACTIC_COLORS } from './incidentData';
import IncidentCard from './IncidentCard';
import TacticColumn from './TacticColumn';
import RobotCharacter from './RobotCharacter';
import JsonDiagram from './JsonDiagram';

const INTRO_DELAY = 2200;
const STEP_DURATION = 5000; // 투어 스텝 간격 (5초)
const VIDEO_SWITCH_INTERVAL = 5000; // 배경 영상 교체 간격 (5초)

// 배경 영상 목록 (폴더 기반, 투어와 독립)
const HERO_VIDEOS = [
  '/videos/hero/wannacry-ia.mp4',
  '/videos/hero/apt1-exec.mp4',
  '/videos/hero/wannacry-exec.mp4',
  '/videos/hero/stuxnet-evasion.mp4',
  '/videos/hero/solarwinds-2020.mp4',
];

// ── 타이핑 효과 훅 ──
function useTypingEffect(text, isActive, speed = 45) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isActive) { setDisplayed(''); setDone(false); return; }
    let i = 0;
    setDisplayed('');
    setDone(false);
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, isActive, speed]);

  return { displayed, done };
}

// ── 플로팅 파티클 배경 ──
function FloatingParticles({ activeColor, isDark }) {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: activeColor || (isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.3)'),
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, isDark ? 0.6 : 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── 스텝 인디케이터 ──
function StepIndicator({ current, total, tourPhase, isDark }) {
  if (tourPhase === 'intro') return null;
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {Array.from({ length: total }, (_, i) => {
        const tacticColors = TACTIC_COLORS[TOUR_SEQUENCE[i]?.tacticId];
        return (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: i === current ? 16 : 6,
              height: 6,
              backgroundColor: i === current
                ? (isDark ? tacticColors?.dark?.hex : tacticColors?.hex) || '#94a3b8'
                : i < current || tourPhase === 'complete'
                  ? (isDark ? '#475569' : '#94a3b8')
                  : (isDark ? '#1e293b' : '#e2e8f0'),
            }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </div>
  );
}

// ── 공격 흐름 화살표 ──
function AttackFlowArrows({ activeTacticIndex, isDark }) {
  return (
    <div className="hidden md:flex items-center justify-center gap-0 my-1 px-4 max-w-6xl mx-auto">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flex-1 flex items-center">
          <motion.div
            className="h-[2px] flex-1 rounded-full"
            animate={{
              backgroundColor: i < activeTacticIndex
                ? (isDark ? TACTIC_COLORS[TACTICS[i]?.id]?.dark?.hex : TACTIC_COLORS[TACTICS[i]?.id]?.hex) || '#e2e8f0'
                : isDark ? '#1e293b' : '#e2e8f0',
              scaleX: i === activeTacticIndex - 1 ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            animate={{
              color: i < activeTacticIndex
                ? (isDark ? TACTIC_COLORS[TACTICS[i + 1]?.id]?.dark?.hex : TACTIC_COLORS[TACTICS[i + 1]?.id]?.hex) || '#94a3b8'
                : isDark ? '#334155' : '#d1d5db',
              scale: i === activeTacticIndex - 1 ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold mx-0.5"
          >
            ▸
          </motion.div>
        </div>
      ))}
    </div>
  );
}

// ── 다크/라이트 토글 아이콘 ──
function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      className={`p-1.5 rounded-md border transition-all backdrop-blur-sm
        ${isDark
          ? 'bg-slate-800/60 border-slate-700 text-amber-400 hover:bg-slate-700/80'
          : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white/80'}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </motion.button>
  );
}

// ── 위험도 뱃지 ──
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
  const labels = { critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${styles[severity] || styles.medium}`}>
      {labels[severity] || severity}
    </span>
  );
}

// ── 상세 정보 패널 ──
function DetailPanel({ incident, language, isDark, onClose }) {
  const ht = HERO_TEXT[language] || HERO_TEXT.ko;
  const detail = incident.detailedInfo;
  const lang = language === 'ko' || language === 'en' ? language : 'en';

  if (!detail) return null;

  const cardBg = isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200';
  const textMain = isDark ? 'text-slate-200' : 'text-slate-700';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const labelBg = isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500';
  const divider = isDark ? 'border-slate-700/50' : 'border-slate-200';

  const tacticId = TACTICS.find(t => t.incidents.some(inc => inc.id === incident.id))?.id;
  const colors = TACTIC_COLORS[tacticId];
  const accentText = isDark ? colors?.dark?.text : colors?.text;

  return (
    <motion.div
      key={incident.id}
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      className={`mt-4 w-full max-w-2xl mx-auto backdrop-blur-md rounded-xl border shadow-xl p-4 md:p-5 ${cardBg}`}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`text-sm md:text-base font-bold ${textMain}`}>
            {incident.name}
            {incident.year && <span className={`font-normal ml-2 ${textMuted}`}>({incident.year})</span>}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-mono text-xs ${accentText || textSub}`}>{incident.techniqueId}</span>
            <span className={textMuted}>—</span>
            <span className={`text-xs ${textSub}`}>{incident.technique}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={detail.severity} isDark={isDark} />
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-slate-500/20 transition-colors ${textMuted}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* 설명 */}
      <p className={`text-xs leading-relaxed mb-3 ${textSub}`}>
        {incident.description?.[language] || incident.description?.ko}
      </p>

      <div className={`border-t ${divider} pt-3`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 공격 경로 */}
          <div>
            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
              {ht.detailAttackVector}
            </div>
            <div className={`text-[11px] leading-relaxed ${textMain}`}>
              {detail.attackVector[lang] || detail.attackVector.ko}
            </div>
          </div>

          {/* 피해 대상 */}
          <div>
            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
              {ht.detailAffected}
            </div>
            <div className={`text-[11px] leading-relaxed ${textMain}`}>
              {detail.affectedOrgs[lang] || detail.affectedOrgs.ko}
            </div>
          </div>

          {/* 타임라인 */}
          <div>
            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
              {ht.detailTimeline}
            </div>
            <div className={`text-[11px] leading-relaxed font-mono ${textSub}`}>
              {detail.timeline[lang] || detail.timeline.ko}
            </div>
          </div>

          {/* 교훈 */}
          <div>
            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
              {ht.detailLessons}
            </div>
            <div className={`text-[11px] leading-relaxed ${textMain}`}>
              {detail.lessonsLearned[lang] || detail.lessonsLearned.ko}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroIncidentMatrix({
  heroPhase,
  enterMatrix,
  skipHero,
  language,
  setLanguage,
  langOptions,
  isLoggedIn,
  navigate,
}) {
  const [tourStep, setTourStep] = useState(-1);
  const [tourPhase, setTourPhase] = useState('intro');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDark, setIsDark] = useState(false); // 기본 라이트 모드
  const isPausedRef = useRef(false);
  const timerRef = useRef(null);

  const ht = HERO_TEXT[language] || HERO_TEXT.ko;

  // 타이핑 효과
  const fullHeader = `${ht.header} ${ht.headerAccent}`;
  const { displayed: typedHeader, done: typingDone } = useTypingEffect(
    fullHeader,
    heroPhase === 'entering',
    35,
  );

  const currentTourItem = tourStep >= 0 && tourStep < TOTAL_TOUR_STEPS
    ? TOUR_SEQUENCE[tourStep] : null;

  // 현재 활성 incident 객체 룩업 (SpeechBubble 전달용)
  const currentIncidentObj = useMemo(() => {
    if (!currentTourItem) return null;
    const tactic = TACTICS.find(t => t.id === currentTourItem.tacticId);
    return tactic?.incidents.find(i => i.id === currentTourItem.incidentId) || null;
  }, [currentTourItem]);

  const baseActiveColor = currentTourItem
    ? TACTIC_COLORS[currentTourItem.tacticId]
    : null;

  const activeGlowRgb = baseActiveColor
    ? (isDark ? baseActiveColor.dark.glowRgb : baseActiveColor.glowRgb)
    : null;

  const activeTacticIndex = currentTourItem
    ? TACTICS.findIndex(t => t.id === currentTourItem.tacticId)
    : -1;

  // intro → touring
  useEffect(() => {
    if (heroPhase !== 'entering') return;
    const introTimer = setTimeout(() => {
      setTourPhase('touring');
      setTourStep(0);
    }, INTRO_DELAY);
    return () => clearTimeout(introTimer);
  }, [heroPhase]);

  // ── 투어 진행 (고정 5초 간격, 무한 반복) ──
  const advanceTour = useCallback(() => {
    if (isPausedRef.current) {
      timerRef.current = setTimeout(() => advanceTour(), 500);
      return;
    }
    setTourStep(prev => {
      // 마지막 스텝이면 처음으로 돌아감 (무한 루프)
      if (prev >= TOTAL_TOUR_STEPS - 1) {
        return 0;
      }
      return prev + 1;
    });
  }, []);

  useEffect(() => {
    if (tourPhase !== 'touring' || tourStep < 0) return;
    timerRef.current = setTimeout(advanceTour, STEP_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [tourStep, tourPhase, advanceTour]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // ── 배경 영상 무한 루프 (투어 독립) ──
  const [videoIdx, setVideoIdx] = useState(0);
  const bgVideoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setVideoIdx(prev => (prev + 1) % HERO_VIDEOS.length);
    }, VIDEO_SWITCH_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v) return;
    v.src = HERO_VIDEOS[videoIdx];
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [videoIdx]);

  // 호버 시 일시정지/재개
  const handlePause = useCallback(() => { isPausedRef.current = true; }, []);
  const handleResume = useCallback(() => { isPausedRef.current = false; }, []);
  const handleCardClick = useCallback((incident) => {
    setSelectedIncident(prev => prev?.id === incident.id ? null : incident);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden"
      initial={{ y: 0 }}
      animate={{ y: heroPhase === 'sliding' ? '-100%' : 0 }}
      transition={heroPhase === 'sliding' ? { duration: 0.65, ease: [0.55, 0, 0.1, 1] } : { duration: 0 }}
    >
      {/* 동적 배경 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isDark
            ? activeGlowRgb
              ? `linear-gradient(135deg, #0f172a 0%, rgba(${activeGlowRgb}, 0.08) 40%, #1e293b 70%, #0f172a 100%)`
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
            : activeGlowRgb
              ? `linear-gradient(135deg, #f0f4f8 0%, rgba(${activeGlowRgb}, 0.06) 40%, #d9e2ec 70%, #e8edf3 100%)`
              : 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 50%, #e8edf3 100%)',
        }}
        transition={{ duration: 0.8 }}
      />

      {/* 전체화면 배경 영상 (항상 재생, 최대한 은은하게) */}
      <div className="absolute inset-0 z-[1]">
        <video
          ref={bgVideoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          style={{ opacity: 0.28 }}
        />
        {/* 오버레이: 배경 영상이 은은하게 보이도록 */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.72) 40%, rgba(15,23,42,0.82) 100%)'
              : 'linear-gradient(to bottom, rgba(240,244,248,0.85) 0%, rgba(240,244,248,0.78) 40%, rgba(240,244,248,0.85) 100%)',
          }}
        />
      </div>

      {/* 플로팅 파티클 */}
      <FloatingParticles
        activeColor={activeGlowRgb ? `rgba(${activeGlowRgb}, ${isDark ? 0.5 : 0.35})` : undefined}
        isDark={isDark}
      />

      {/* 그리드 + 스캔라인 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            opacity: isDark ? 1 : 0.025,
          }}
        />
        <motion.div
          className={`absolute left-0 right-0 h-[1px] ${isDark
            ? 'bg-gradient-to-r from-transparent via-slate-500/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-400/20 to-transparent'
          }`}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* 상단 컨트롤 바 */}
      <motion.div
        className="absolute top-4 right-4 z-50 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
        <button
          onClick={skipHero}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider rounded-md border transition-all backdrop-blur-sm
            ${isDark
              ? 'text-slate-500 hover:text-slate-300 bg-slate-800/60 hover:bg-slate-700/80 border-slate-700'
              : 'text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white/80 border-slate-200'}
          `}
        >
          {ht.skip} <SkipForwardFilled size={12} />
        </button>
      </motion.div>

      {/* 언어 선택기 */}
      <motion.div
        className="absolute top-4 left-4 z-50 flex gap-1 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {langOptions.map(opt => (
          <button
            key={opt.code}
            onClick={() => { storeLang(opt.code); setLanguage(opt.code); }}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono rounded border transition-all backdrop-blur-sm
              ${language === opt.code
                ? isDark
                  ? 'bg-slate-800/90 border-slate-600 text-slate-200 shadow-sm'
                  : 'bg-white/90 border-slate-400 text-slate-700 shadow-sm'
                : isDark
                  ? 'bg-slate-800/40 border-slate-700 text-slate-500 hover:bg-slate-700/60 hover:text-slate-300'
                  : 'bg-white/40 border-slate-200 text-slate-400 hover:bg-white/60 hover:text-slate-600'}
            `}
          >
            <span className="text-xs">{opt.flag}</span>
            <span className="hidden sm:inline">{opt.code.toUpperCase()}</span>
          </button>
        ))}
      </motion.div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-3 sm:px-6 pt-14 pb-8 overflow-y-auto">

        {/* 타이핑 헤더 — 배경 영상 위에서 가독성 확보 */}
        <motion.div
          className={`text-center mb-3 md:mb-5 max-w-3xl rounded-2xl px-6 py-4
            ${isDark ? 'bg-slate-900/70 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-snug mb-2 min-h-[3.5rem] md:min-h-[4.5rem]
            ${isDark ? 'text-slate-100' : 'text-slate-800'}
          `}>
            <span>{typedHeader.slice(0, ht.header.length)}</span>
            {typedHeader.length > ht.header.length && (
              <>
                <br />
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                  {typedHeader.slice(ht.header.length + 1)}
                </span>
              </>
            )}
            {!typingDone && (
              <motion.span
                className={`inline-block w-[2px] h-[1.1em] ml-0.5 align-middle ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </h1>

          <AnimatePresence>
            {typingDone && (
              <motion.p
                className={`text-xs sm:text-sm leading-relaxed max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {ht.subheader}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 매트릭스 타이틀 + 스텝 인디케이터 */}
        <motion.div
          className={`text-center mb-2 md:mb-3 flex flex-col items-center rounded-lg px-4 py-2
            ${isDark ? 'bg-slate-900/60 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'}
          `}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 15 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2 className={`text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide
            ${isDark ? 'text-slate-400' : 'text-slate-600'}
          `}>
            {ht.matrixTitle}
          </h2>
          <StepIndicator current={tourStep} total={TOTAL_TOUR_STEPS} tourPhase={tourPhase} isDark={isDark} />
        </motion.div>

        {/* 공격 흐름 화살표 */}
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: tourPhase !== 'intro' ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <AttackFlowArrows activeTacticIndex={activeTacticIndex} isDark={isDark} />
        </motion.div>

        {/* 매트릭스 + 사이드 패널 */}
        <div className="w-full max-w-7xl flex gap-4 items-start justify-center">
          {/* 로봇 캐릭터 */}
          <RobotCharacter
            position="left"
            isActive={tourPhase === 'touring'}
            isDark={isDark}
          />

          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: typingDone ? 1 : 0, scale: typingDone ? 1 : 0.97 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2 md:grid-cols-5 md:gap-2">
              {TACTICS.map((tactic) => (
                <TacticColumn
                  key={tactic.id}
                  tactic={tactic}
                  isActiveTactic={currentTourItem?.tacticId === tactic.id}
                  language={language}
                  isDark={isDark}
                >
                  {tactic.incidents.map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      tacticId={tactic.id}
                      isHighlighted={
                        currentTourItem?.incidentId === incident.id ||
                        selectedIncident?.id === incident.id
                      }
                      tourComplete={tourPhase === 'complete'}
                      onClick={handleCardClick}
                      onMouseEnter={handlePause}
                      onMouseLeave={handleResume}
                      language={language}
                      isDark={isDark}
                    />
                  ))}
                </TacticColumn>
              ))}
            </div>
          </motion.div>

          <JsonDiagram
            isActive={tourPhase === 'touring'}
            isDark={isDark}
            className="!relative !bottom-auto !right-auto shrink-0 self-start mt-8"
          />
        </div>

        {/* 활성 사고 인포 배너 (가시성 개선) */}
        <AnimatePresence mode="wait">
          {currentIncidentObj && tourPhase === 'touring' ? (
            <motion.div
              key={currentIncidentObj.id}
              className={`mt-3 md:mt-4 w-full max-w-3xl mx-auto rounded-xl border px-4 py-3 md:px-6 md:py-4 backdrop-blur-md shadow-md
                ${isDark
                  ? 'bg-slate-900/90 border-slate-700/60'
                  : 'bg-white/95 border-slate-200/80 shadow-lg'}
              `}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-start gap-3">
                {/* 택틱 색상 바 */}
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{
                    background: isDark
                      ? TACTIC_COLORS[currentTourItem?.tacticId]?.dark?.hex
                      : TACTIC_COLORS[currentTourItem?.tacticId]?.hex,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm md:text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                      {currentIncidentObj.name}
                    </span>
                    {currentIncidentObj.year && (
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        ({currentIncidentObj.year})
                      </span>
                    )}
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-700'}`}>
                      {currentIncidentObj.techniqueId}
                    </span>
                  </div>
                  <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {currentIncidentObj.description?.[language] || currentIncidentObj.description?.ko}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : tourPhase === 'complete' ? (
            <motion.div
              key="complete-text"
              className="mt-4 md:mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {ht.incidentCases}
              </p>
              <p className={`text-[10px] max-w-md mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {ht.incidentDesc}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* 선택된 사고 상세 패널 */}
        <AnimatePresence>
          {selectedIncident && (
            <DetailPanel
              incident={selectedIncident}
              language={language}
              isDark={isDark}
              onClose={() => setSelectedIncident(null)}
            />
          )}
        </AnimatePresence>

        {/* CTA 버튼 (투어 완료 시) */}
        <AnimatePresence>
          {tourPhase === 'complete' && (
            <motion.div
              className="mt-6 md:mt-8 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
            >
              <div className="flex flex-wrap justify-center gap-3">
                <motion.button
                  onClick={enterMatrix}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg shadow-lg transition-all active:scale-[0.98]
                    ${isDark
                      ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30 hover:shadow-blue-400/40'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40'}
                  `}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {ht.ctaCurriculum} <ArrowRight size={16} />
                </motion.button>
                <motion.button
                  onClick={enterMatrix}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg border shadow-sm transition-all active:scale-[0.98]
                    ${isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-500'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'}
                  `}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {ht.ctaLearnMore}
                </motion.button>
              </div>
              {!isLoggedIn && (
                <button
                  onClick={() => navigate('/login')}
                  className={`text-xs underline underline-offset-2 transition-colors
                    ${isDark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}
                  `}
                >
                  {ht.login}
                </button>
              )}
              <a
                href="https://gotroot.co.kr"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[10px] transition-colors ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'}`}
              >
                gotroot.co.kr
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 투어 완료 전 진입 버튼 */}
        {tourPhase !== 'complete' && (
          <motion.div
            className="mt-auto pt-4 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <button
              onClick={enterMatrix}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg border shadow-sm transition-all
                ${isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border-slate-700'
                  : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-800 border-slate-200'}
              `}
            >
              {ht.ctaCurriculum} <ArrowRight size={14} />
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => navigate('/login')}
                className={`text-[10px] underline underline-offset-2 transition-colors
                  ${isDark ? 'text-slate-600 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}
                `}
              >
                {ht.login}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
