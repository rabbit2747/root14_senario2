import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimationStage, { Icons } from './AnimationPresets';
import GlossarySidebar from './GlossarySidebar';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 공용 서브 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Typewriter = ({ text }) => {
  const letters = Array.from(text);
  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.01 } } };
  return (
    <motion.div style={{ display: "inline-block" }} variants={container} initial="hidden" animate="visible">
      {letters.map((letter, index) => (
        <motion.span key={index} variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}>{letter}</motion.span>
      ))}
    </motion.div>
  );
};

const ShootingStarBackground = memo(({ logoSrc }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.img
          key={i} src={logoSrc} alt="" className="absolute object-contain"
          style={{
            width: Math.random() * 20 + 20 + "px",
            left: Math.random() * 100 + "%",
            rotate: Math.random() * 30 - 15 + "deg",
            willChange: "transform, opacity"
          }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity, ease: "linear", delay: -(Math.random() * 10)
          }}
        />
      ))}
    </div>
  );
});

// step에 따라 활성 용어 키 계산
function getActiveTerms(attackCase, step) {
  const terms = [];
  if (step >= 1 && attackCase.targets.step1) terms.push(attackCase.targets.step1);
  if (step >= 2 && attackCase.targets.step2) terms.push(attackCase.targets.step2);
  if (step >= 3 && attackCase.targets.step3) terms.push(attackCase.targets.step3);
  return Array.from(new Set(terms));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TacticWidgetTemplate — JSON 데이터만 넣으면 자동 생성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @param {{ tacticData: Object }} props
 * tacticData 구조: { tacticId, tacticName, dictionaryTitle, bgLogo, speedStorageKey,
 *                    glossary, attackCases, stepTimings, speedOptions }
 */
export default function TacticWidgetTemplate({ tacticData, onComplete }) {
  const {
    dictionaryTitle = 'Dictionary',
    bgLogo = '/logo/logo-name-dark-nobg.png',
    speedStorageKey = 'widget_speed',
    glossary = {},
    attackCases = [],
    stepTimings = { alert: 3000, context: 4000, mechanism: 5000, identified: 5500 },
    speedOptions = [{ label: '0.5x', value: 0.5 }, { label: '1x', value: 1 }, { label: '1.5x', value: 1.5 }, { label: '2x', value: 2 }],
  } = tacticData;

  const [caseIndex, setCaseIndex] = useState(0);
  const [step, setStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(() => {
    const saved = parseFloat(localStorage.getItem(speedStorageKey));
    return speedOptions.some(o => o.value === saved) ? saved : 1;
  });

  const handleSpeedChange = (value) => {
    setSpeed(value);
    localStorage.setItem(speedStorageKey, String(value));
  };

  const handleStepClick = (targetStep) => {
    setStep(targetStep);
    setIsPlaying(false);
  };

  const currentCase = attackCases[caseIndex];
  const activeTermKeys = currentCase ? getActiveTerms(currentCase, step) : [];

  // 자동 step 진행
  useEffect(() => {
    if (!isPlaying || !currentCase) return;
    let timer;
    if (step === 1) timer = setTimeout(() => setStep(2), stepTimings.alert / speed);
    else if (step === 2) timer = setTimeout(() => setStep(3), stepTimings.context / speed);
    else if (step === 3) timer = setTimeout(() => setStep(4), stepTimings.mechanism / speed);
    else if (step === 4) {
      timer = setTimeout(() => {
        const nextIndex = caseIndex + 1;
        if (nextIndex >= attackCases.length && onComplete) {
          onComplete();
        } else {
          setCaseIndex(nextIndex % attackCases.length);
          setStep(1);
        }
      }, stepTimings.identified / speed);
    }
    return () => clearTimeout(timer);
  }, [step, caseIndex, isPlaying, speed, attackCases.length, currentCase, stepTimings]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  if (!currentCase) return null;

  return (
    <div className="flex flex-col xl:flex-row min-h-[480px] sm:min-h-[750px] w-full bg-slate-50 font-sans text-slate-800 overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-200 relative">
      {/* ── 메인 영역 ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC] z-10">
        {/* 배경 그리드 */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <ShootingStarBackground logoSrc={bgLogo} />

        {/* ── 헤더: 스텝 인디케이터 + 속도/재생 ── */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 flex flex-col sm:flex-row sm:items-center px-4 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-16 lg:h-20 justify-between z-20 shrink-0 shadow-sm relative gap-1.5 sm:gap-0">
          <div className="flex gap-1.5 sm:gap-2 lg:gap-4 w-full sm:max-w-lg sm:mr-4">
            {['Alert', 'Context', 'Mechanism', 'Identified'].map((label, idx) => {
              const s = idx + 1;
              const isActive = step === s;
              const isPassed = step > s;
              return (
                <div key={s} onClick={() => handleStepClick(s)} className="flex-1 flex flex-col gap-1 sm:gap-1.5 relative cursor-pointer group" title={`${label} 단계로 이동`}>
                  <div className={`h-1 sm:h-1.5 w-full rounded-full transition-colors duration-500 ${isActive ? 'bg-blue-600' : isPassed ? 'bg-blue-200' : 'bg-slate-200'} group-hover:bg-blue-400`} />
                  <span className={`text-[7px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-700' : isPassed ? 'text-slate-500' : 'text-slate-400'} group-hover:text-blue-600`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 z-30">
            <div className="flex items-center bg-slate-100 rounded-full border border-slate-200 p-0.5">
              {speedOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSpeedChange(opt.value)}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all ${speed === opt.value ? 'bg-white text-blue-600 shadow-sm border border-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={togglePlay} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all border ${isPlaying ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 shadow-inner' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 shadow-md'}`}>
              {isPlaying ? <><Icons.Pause /> <span className="hidden sm:inline">Playing</span></> : <><Icons.Play /> <span className="hidden sm:inline">Paused</span></>}
            </button>
          </div>
        </header>

        {/* ── 컨텐츠 본문 ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 z-10 relative">
          <AnimatePresence mode="wait">
            <motion.div key={caseIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-3xl mx-auto flex flex-col gap-5 relative">

              {/* Step 1: Alert */}
              <div className="relative">
                {step >= 1 && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl relative overflow-hidden z-10">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                      <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Threat Intel Alert</span>
                    </div>
                    <p className="font-mono text-xs lg:text-[13px] text-emerald-400 leading-relaxed break-words">
                      <span className="text-slate-500">{new Date().toISOString().replace('T', ' ').slice(0, 19)}</span>{' '}
                      <span className="text-red-400 font-bold">[DETECTED]</span> {currentCase.log}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Step 2 + 3 + 4 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                {/* 좌측: Context */}
                <div className="relative flex flex-col gap-5">
                  {step >= 2 && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/95 backdrop-blur p-6 rounded-xl border border-slate-200 shadow-sm h-full z-10">
                      <h3 className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                        <Icons.FileCode /> Incident Context
                      </h3>
                      <div className="text-[13px] text-slate-700 leading-loose font-medium">
                        <Typewriter text={currentCase.report} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 우측: Mechanism + Identified */}
                <div className="relative flex flex-col gap-5">
                  {/* Mechanism */}
                  <div className="relative">
                    {step >= 3 && (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-slate-50/95 backdrop-blur border border-slate-200 p-6 rounded-xl z-10 relative shadow-sm">
                        <h3 className="text-[10px] font-black text-blue-600 tracking-wider uppercase mb-3">
                          Mechanism: {currentCase.mechanismTitle}
                        </h3>
                        <p className="text-[12px] lg:text-[13px] text-slate-600 leading-relaxed text-justify mb-4">
                          {currentCase.mechanismDesc}
                        </p>
                        <AnimationStage preset={currentCase.animationPreset} />
                      </motion.div>
                    )}
                  </div>

                  {/* Identified */}
                  {step >= 4 && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 90, damping: 20 }} className="bg-white border-2 border-slate-800 p-6 rounded-xl shadow-xl relative overflow-hidden z-10">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                      <div className="mb-5 pb-5 border-b border-slate-100">
                        <h3 className="text-[10px] font-black text-blue-600 tracking-wider uppercase mb-1.5">Sub-Technique Identified</h3>
                        <div className="text-xl lg:text-2xl font-black text-slate-800 leading-tight">{currentCase.subTechniqueName}</div>
                        <div className="text-[11px] lg:text-xs font-mono font-bold text-slate-400 mt-2">{currentCase.subTechniqueId}</div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tactic</span>
                          <span className="font-bold text-slate-600 text-[11px]">{currentCase.tactic}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Technique</span>
                          <span className="font-bold text-slate-600 text-[11px]">{currentCase.technique}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── 용어 사전 사이드바 ── */}
      <GlossarySidebar
        glossary={glossary}
        activeTermKeys={activeTermKeys}
        title={dictionaryTitle}
      />
    </div>
  );
}
