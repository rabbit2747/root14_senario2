/**
 * 공통 로딩 화면 컴포넌트 (v1.2.0)
 * macOS 윈도우 디자인 + Paperlogy 폰트 + 스텝 리스트 애니메이션
 *
 * @param {Array<{label: string, status: string}>} steps - 로딩 단계 목록
 * @param {boolean} isDark - 다크 모드 여부
 * @param {string} [title] - 로딩 화면 타이틀 (기본: 'Loading')
 * @param {string} [subtitle] - 서브타이틀 (기본: '')
 *
 * @example
 *   <LoadingScreen
 *     steps={[
 *       { label: '보안 채널 연결', status: 'ENCRYPTED' },
 *       { label: '문제 은행 복호화', status: 'DECRYPTING' },
 *     ]}
 *     isDark={false}
 *     title="Adaptive Assessment"
 *     subtitle="MITRE ATT&CK"
 *   />
 */
import { useState, useEffect } from 'react';

export default function LoadingScreen({ steps = [], isDark = false, title = 'Loading', subtitle = '' }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (steps.length === 0) return;
    const stepTimer = setInterval(() => {
      setActiveStep(p => {
        const next = (p + 1) % steps.length;
        setPulse(true);
        setTimeout(() => setPulse(false), 300);
        return next;
      });
    }, 1800);
    const progTimer = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8 + 3, 92)), 600);
    return () => { clearInterval(stepTimer); clearInterval(progTimer); };
  }, [steps.length]);

  // 스텝이 없으면 심플 로딩
  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <div className={`w-5 h-5 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-[#a1a1aa]' : 'border-[#71717a]'}`} />
        <p className={`text-[13px] font-medium ${isDark ? 'text-[#a1a1aa]' : 'text-[#71717a]'}`}>{title}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
      {/* 방패 아이콘 — 미니멀 펄스 */}
      <div className="relative flex items-center justify-center">
        <div
          className={`absolute w-20 h-20 rounded-full transition-all duration-700 ${pulse ? 'scale-125 opacity-0' : 'scale-100 opacity-20'}`}
          style={{ background: isDark
            ? 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)'
          }}
        />
        <svg className="w-12 h-12" fill="none" stroke={isDark ? '#a1a1aa' : '#a1a1aa'} strokeWidth="1.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      </div>

      {/* 타이틀 */}
      <div className="text-center space-y-1.5">
        <p className={`text-[13px] font-semibold tracking-[0.25em] uppercase ${isDark ? 'text-[#a1a1aa]' : 'text-[#71717a]'}`}>
          {title}
        </p>
        {subtitle && (
          <p className={`text-[11px] tracking-widest ${isDark ? 'text-[#52525b]' : 'text-[#a1a1aa]'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* 스텝 로그 */}
      <div className="w-full max-w-[280px] space-y-2.5">
        {steps.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div
              key={i}
              className="flex items-center justify-between transition-all duration-500"
              style={{ opacity: done ? 0.35 : active ? 1 : 0.15 }}
            >
              <div className="flex items-center gap-2.5">
                {done ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke={isDark ? '#4ade80' : '#16a34a'} strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : active ? (
                  <div className={`w-3.5 h-3.5 flex-shrink-0 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-[#a1a1aa]' : 'border-[#71717a]'}`} />
                ) : (
                  <div className={`w-3.5 h-3.5 flex-shrink-0 rounded-full border ${isDark ? 'border-[#3f3f46]' : 'border-[#d4d4d8]'}`} />
                )}
                <span className={`text-[12px] font-medium ${isDark ? 'text-[#d4d4d8]' : 'text-[#3f3f46]'}`}>
                  {step.label}
                </span>
              </div>
              {(done || active) && (
                <span className={`text-[9px] font-mono tracking-wider ${done ? (isDark ? 'text-[#4ade80]' : 'text-[#16a34a]') : (isDark ? 'text-[#71717a]' : 'text-[#a1a1aa]')}`}>
                  {done ? 'DONE' : step.status}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full max-w-[280px] mt-2">
        <div className={`h-[3px] rounded-full overflow-hidden ${isDark ? 'bg-[#27272a]' : 'bg-[#e4e4e7]'}`}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: isDark
                ? 'linear-gradient(90deg, #52525b 0%, #a1a1aa 100%)'
                : 'linear-gradient(90deg, #a1a1aa 0%, #71717a 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 채점/검증 오버레이 (인라인 사용)
 * @param {boolean} isDark
 * @param {string} [text] - 표시 텍스트 (기본: 'VERIFYING')
 */
export function VerifyingOverlay({ isDark = false, text = 'VERIFYING' }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] rounded-2xl"
      style={{ background: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)' }}
    >
      <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full shadow-sm ${isDark ? 'bg-[#242424] border border-[#3f3f46]' : 'bg-white border border-[#e4e4e7]'}`}>
        <div className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-[#a1a1aa]' : 'border-[#71717a]'}`} />
        <span className={`text-[12px] font-semibold tracking-wider ${isDark ? 'text-[#a1a1aa]' : 'text-[#52525b]'}`}>
          {text}
        </span>
      </div>
    </div>
  );
}
