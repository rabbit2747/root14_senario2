import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from '@carbon/icons-react';
import { storeLang } from '../LangToggle';
import { TACTICS, TOUR_SEQUENCE, TOTAL_TOUR_STEPS, HERO_TEXT, TACTIC_COLORS } from './incidentData';
import IncidentCard from './IncidentCard';
import TacticColumn from './TacticColumn';
import DetailPanel from './DetailPanel';
import FullScreenReportModal from './FullScreenReportModal';

const INTRO_DELAY = 2200;
const STEP_DURATION = 10000; // 투어 스텝 간격 (10초)
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

// ── 투어 진행 바 컴포넌트 ──
// key={tourStep}로 스텝 변경 시 CSS 애니메이션 리셋, animationPlayState로 hover 시 정지
function TourProgressBar({ tourStep, isRunning, isDark, accentHex }) {
  if (tourStep < 0) return null;
  return (
    <div className={`w-full h-[2px] rounded-full overflow-hidden mt-2
      ${isDark ? 'bg-slate-700/40' : 'bg-slate-200/60'}`}
    >
      <div
        key={tourStep}
        className="h-full rounded-full anim-tour-progress"
        style={{
          background: accentHex || (isDark ? '#64748b' : '#94a3b8'),
          animationPlayState: isRunning ? 'running' : 'paused',
          width: '0%',
        }}
      />
    </div>
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
  const [fullScreenIncident, setFullScreenIncident] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100); // 50 ~ 200 범위
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

  // ── 패널에 표시할 활성 인시던트: 투어 현재 항목 (무비모드)
  const activeIncident = currentIncidentObj;

  // 활성 전술 ID (패널 색상 + panelSide 계산용)
  const activeTacticId = currentTourItem?.tacticId || null;

  // 패널 위치: 우측 전술(index >= 3)이면 좌측에 패널 표시, 그 외 우측
  const panelSide = useMemo(() => {
    const idx = TACTICS.findIndex(t => t.id === activeTacticId);
    return idx >= 3 ? 'left' : 'right';
  }, [activeTacticId]);

  // 패널에 전달할 데이터 (DetailPanel.jsx activeCardData 구조)
  const activeCardData = useMemo(() => {
    if (!activeIncident) return null;
    const lang = language === 'ko' || language === 'en' ? language : 'en';
    return {
      id:           activeIncident.id,
      title:        activeIncident.name,
      year:         activeIncident.year,
      techniqueId:  activeIncident.techniqueId,
      technique:    activeIncident.technique,
      detailDesc:   activeIncident.description?.[language]
                    || activeIncident.description?.en
                    || activeIncident.description?.ko
                    || '',
      severity:     activeIncident.detailedInfo?.severity,
      attackVector: activeIncident.detailedInfo?.attackVector?.[lang]
                    || activeIncident.detailedInfo?.attackVector?.ko
                    || '',
      affectedOrgs: activeIncident.detailedInfo?.affectedOrgs?.[lang]
                    || activeIncident.detailedInfo?.affectedOrgs?.ko
                    || '',
    };
  }, [activeIncident, language]);

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

  // ── 투어 진행 (고정 5초 간격, 무한 반복 — 무비모드: 사용자 정지 불가) ──
  const advanceTour = useCallback(() => {
    setTourStep(prev => {
      if (prev >= TOTAL_TOUR_STEPS - 1) return 0;
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

  // 무비모드: 사용자가 재생을 컨트롤할 수 없음 (클릭/호버 인터랙션 없음)

  return (
    <>
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

      {/* 상단 컨트롤 바 — 좌: 다크모드 + 확대/축소만 */}
      <motion.div
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
        {/* 확대/축소 컨트롤 (50~200%) */}
        <div className={`flex items-center gap-0.5 rounded-md border overflow-hidden backdrop-blur-sm
          ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/50 border-slate-200'}`}
        >
          <motion.button
            onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
            disabled={zoomLevel <= 50}
            className={`px-1.5 py-1.5 text-xs transition-colors
              ${isDark
                ? 'text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 disabled:opacity-30'
                : 'text-slate-500 hover:bg-white/80 disabled:opacity-30'}
            `}
            whileTap={{ scale: 0.9 }}
            title="Zoom Out"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
          <span className={`px-1 text-[9px] font-mono tabular-nums select-none
            ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
          >
            {zoomLevel}%
          </span>
          <motion.button
            onClick={() => setZoomLevel(z => Math.min(200, z + 10))}
            disabled={zoomLevel >= 200}
            className={`px-1.5 py-1.5 text-xs transition-colors
              ${isDark
                ? 'text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 disabled:opacity-30'
                : 'text-slate-500 hover:bg-white/80 disabled:opacity-30'}
            `}
            whileTap={{ scale: 0.9 }}
            title="Zoom In"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
        </div>
      </motion.div>


      {/* 언어 선택기 — 우측 */}
      <motion.div
        className="absolute top-4 right-4 z-50 flex gap-1 flex-wrap justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
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
      <div className="relative z-10 flex flex-col items-center justify-start h-full px-3 sm:px-6 pt-24 pb-8 overflow-y-auto">

        {/* ── 줌 스케일 존: h1 타이틀 + 스텝 인디케이터 + 공격흐름 + 매트릭스 전체 ──
             scale이 이 wrapper에 집중됨으로써 폰트+카드 동시 축소/확대 */}
        <motion.div
          className="w-full flex flex-col items-center"
          animate={{ scale: !typingDone ? 0.97 : zoomLevel / 100 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ transformOrigin: 'top center' }}
        >
          {/* 타이핑 헤더 + CTA 버튼 (h1 바로 아래 배치) */}
          <motion.div
            className="text-center mb-3 md:mb-5 max-w-3xl px-6 py-4"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* 갓루트 로고 — h1 위, 콘텐츠 흐름 안에 자연스럽게 */}
            <motion.div
              className="flex justify-center mb-5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <img
                src={isDark ? '/logo/logo-name-white.png' : '/logo/logo-name-dark-nobg.png'}
                alt="GOTROOT"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain select-none pointer-events-none"
                draggable={false}
                style={{ opacity: isDark ? 0.92 : 0.85 }}
              />
            </motion.div>

            <h1 className={`relative text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-snug mb-4
              ${isDark ? 'text-slate-100' : 'text-slate-800'}
            `}>
              {/* Ghost: 전체 텍스트를 invisible로 렌더링해 컨테이너 높이 사전 할당 */}
              <span aria-hidden="true" className="invisible select-none pointer-events-none">
                {ht.header}
                <br />
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                  {ht.headerAccent}
                </span>
              </span>
              {/* 타이핑 텍스트: ghost 위에 absolute 배치 */}
              <span className="absolute inset-0">
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
              </span>
            </h1>

            {/* CTA 버튼 — 타이핑 완료 후 h1 바로 아래 표시 */}
            <AnimatePresence>
              {typingDone && (
                <motion.div
                  className="flex flex-wrap justify-center gap-2.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.button
                    onClick={() => isLoggedIn ? enterMatrix() : navigate('/level-test')}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]
                      ${isDark
                        ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30 hover:shadow-blue-400/40'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40'}
                    `}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {ht.ctaCurriculum} <ArrowRight size={14} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 스텝 인디케이터 (matrixTitle 텍스트 → 하단 푸터로 이동) */}
          <motion.div
            className="text-center mb-2 md:mb-3 flex flex-col items-center px-4 py-1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 15 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
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

          {/* 매트릭스 + 사이드 패널 (relative 컨테이너: DetailPanel absolute 배치 기준) */}
          <div className="relative w-full max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: typingDone ? 1 : 0 }}
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
                        isHighlighted={currentTourItem?.incidentId === incident.id}
                        tourComplete={tourPhase === 'complete'}
                        language={language}
                        isDark={isDark}
                      />
                    ))}
                  </TacticColumn>
                ))}
              </div>
            </motion.div>

            {/* 투어 진행 바 */}
            <TourProgressBar
              tourStep={tourStep}
              isRunning={true}
              isDark={isDark}
              accentHex={isDark ? baseActiveColor?.dark?.hex : baseActiveColor?.hex}
            />

            {/* 상세 패널 (데스크탑: 우/좌 floating, 모바일: 시트 비활성 — 무비모드) */}
            <DetailPanel
              isOpen={false}
              activeCardData={activeCardData}
              tacticId={activeTacticId}
              isDark={isDark}
              language={language}
              onClose={() => {}}
              onOpenFullScreen={() => setFullScreenIncident(activeIncident)}
              panelSide={panelSide}
              isRunning={true}
              timerKey={tourStep}
            />
          </div>
        </motion.div>
        {/* ── 줌 스케일 존 끝 ── */}

        {/* 활성 사고 인포 배너 — 모바일 전용 */}
        <div className="md:hidden mt-3 w-full max-w-3xl mx-auto" style={{ minHeight: '5rem' }}>
          <AnimatePresence mode="wait">
            {currentIncidentObj && tourPhase === 'touring' && (
              <motion.div
                key={currentIncidentObj.id}
                className={`mt-3 w-full rounded-xl border px-4 py-3 backdrop-blur-md shadow-md
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
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
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
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {currentIncidentObj.description?.[language] || currentIncidentObj.description?.en || currentIncidentObj.description?.ko}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 하단 푸터 — 항상 표시, 줌 스케일 미적용 ── */}
        <motion.div
          className="mt-auto pt-5 pb-1 w-full max-w-3xl mx-auto flex flex-col items-center gap-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 20 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {/* 핵심 학습 모델 문구 (기존 matrixTitle) */}
          <p className={`text-[11px] font-semibold tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {ht.matrixTitle}
          </p>
          {/* 서브헤더 문구 */}
          <p className={`text-[10px] sm:text-xs leading-relaxed max-w-md ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {ht.subheader}
          </p>

          <a
            href="https://gotroot.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] mt-1 transition-colors ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'}`}
          >
            gotroot.co.kr
          </a>
        </motion.div>
      </div>
    </motion.div>

    {/* FullScreenReportModal: 항상 마운트, AnimatePresence는 portal 내부에서 처리
        videoRef로 모달 열릴 때 배경 영상 자동 일시정지/재개 */}
    <FullScreenReportModal
      incident={fullScreenIncident}
      language={language}
      isDark={isDark}
      onClose={() => setFullScreenIncident(null)}
      videoRef={bgVideoRef}
    />
    </>
  );
}
