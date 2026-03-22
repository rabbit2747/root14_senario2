import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

/**
 * 단계별 애니메이션 다이어그램
 * config: { title, steps: [{ label, description, emoji, highlight? }], autoPlay?, intervalMs? }
 */
export default function AnimatedFlow({ config, isDark, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { title, steps = [], autoPlay = false, intervalMs = 3000 } = config || {};

  useEffect(() => {
    if (autoPlay) setIsPlaying(true);
  }, [autoPlay]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, intervalMs, onComplete]);

  const goTo = useCallback((idx) => {
    setCurrentStep(Math.max(0, Math.min(idx, steps.length - 1)));
  }, [steps.length]);

  const reset = () => { setCurrentStep(0); setIsPlaying(false); };

  if (!steps.length) return null;

  const step = steps[currentStep];

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* 헤더 */}
      {title && (
        <div className={`px-5 py-3 border-b text-sm font-bold ${isDark ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-700'}`}>
          🔄 {title}
        </div>
      )}

      {/* 스텝 시각화 */}
      <div className="p-5">
        {/* 단계 인디케이터 */}
        <div className="flex items-center justify-center gap-1 mb-6 flex-wrap">
          {steps.map((s, i) => (
            <button key={i} onClick={() => goTo(i)} className="flex items-center">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer
                ${i === currentStep
                  ? (isDark ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-900/40' : 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200')
                  : i < currentStep
                    ? (isDark ? 'bg-emerald-700/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                    : (isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                }
              `}>
                {s.emoji || (i + 1)}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mx-0.5 transition-colors duration-300 ${
                  i < currentStep ? (isDark ? 'bg-emerald-600' : 'bg-emerald-300') : (isDark ? 'bg-gray-700' : 'bg-gray-200')
                }`} />
              )}
            </button>
          ))}
        </div>

        {/* 현재 스텝 콘텐츠 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <div className="text-4xl mb-3">{step.emoji}</div>
            <h4 className={`text-base font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              {step.label}
            </h4>
            <p className={`text-sm leading-relaxed max-w-lg mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {step.description}
            </p>
            {step.detail && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-mono text-left mx-auto max-w-md ${isDark ? 'bg-[#111] text-green-400' : 'bg-gray-900 text-green-400'}`}>
                {step.detail}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 컨트롤 */}
      <div className={`flex items-center justify-center gap-3 px-5 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <button onClick={reset} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
          <RotateCcw size={16} />
        </button>
        <button onClick={() => goTo(currentStep - 1)} disabled={currentStep === 0}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
          <SkipBack size={16} />
        </button>
        <button
          onClick={() => setIsPlaying(p => !p)}
          className={`p-2 rounded-xl transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={() => goTo(currentStep + 1)} disabled={currentStep >= steps.length - 1}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
          <SkipForward size={16} />
        </button>
        <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {currentStep + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}
