/**
 * ChoiceOverlay — 시네마틱 분기 결정 UI
 * 글래스모피즘 + 페이드인 스태거 + 키보드 단축키
 */
import { useEffect } from 'react';

export default function ChoiceOverlay({ choice, onSelect }) {
  // 키보드 1·2·3 단축키
  useEffect(() => {
    const onKey = (e) => {
      const idx = parseInt(e.key, 10) - 1;
      if (!isNaN(idx) && choice.options[idx]) {
        onSelect(choice.options[idx]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choice, onSelect]);

  if (!choice) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.92) 100%)',
      backdropFilter: 'blur(2px)',
      animation: 'choiceFadeBg 0.6s ease-out',
      zIndex: 30,
      fontFamily: '-apple-system,sans-serif',
    }}>
      <style>{`
        @keyframes choiceFadeBg { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(2px); } }
        @keyframes choiceSlideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes choicePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
          50%     { box-shadow: 0 0 0 4px rgba(251,191,36,0.15); }
        }
      `}</style>

      <div style={{
        maxWidth: 720,
        width: '90%',
        animation: 'choiceSlideUp 0.7s ease-out',
      }}>
        {/* 상단 라벨 */}
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#fbbf24',
          letterSpacing: 6,
          marginBottom: 14,
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ width: 32, height: 1, background: '#fbbf24' }}/>
          DECISION POINT
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#fbbf24',
            animation: 'choicePulse 1.5s ease-in-out infinite',
          }}/>
        </div>

        {/* 프롬프트 */}
        <div style={{
          fontSize: 'clamp(20px, 2.6vw, 28px)',
          fontWeight: 200,
          color: '#fefefe',
          lineHeight: 1.35,
          marginBottom: 8,
          letterSpacing: -0.3,
          textShadow: '0 2px 16px rgba(0,0,0,0.95)',
        }}>
          {choice.prompt}
        </div>

        {/* 컨텍스트 */}
        {choice.context && (
          <div style={{
            fontSize: 11,
            color: '#64748b',
            marginBottom: 32,
            fontFamily: 'monospace',
            letterSpacing: 2,
          }}>
            {choice.context}
          </div>
        )}

        {/* 선택지 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {choice.options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt)}
              style={{
                background: 'rgba(15,23,42,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(100,116,139,0.35)',
                color: '#e2e8f0',
                padding: '16px 18px',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 400,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `choiceSlideUp 0.6s ease-out ${0.3 + i * 0.12}s both`,
                fontFamily: '-apple-system,sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(251,191,36,0.6)';
                e.currentTarget.style.background = 'rgba(67,20,7,0.5)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(100,116,139,0.35)';
                e.currentTarget.style.background = 'rgba(15,23,42,0.55)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {/* 키보드 인덱스 */}
              <span style={{
                width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(100,116,139,0.4)',
                borderRadius: 3,
                color: '#94a3b8',
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {i + 1}
              </span>

              {/* MITRE 태그 */}
              <span style={{
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.4)',
                color: '#fbbf24',
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 2,
                letterSpacing: 1,
                flexShrink: 0,
              }}>
                {opt.tag}
              </span>

              <span style={{ flex: 1, letterSpacing: 0.2 }}>{opt.label}</span>
              <span style={{ color: '#475569', fontSize: 18, marginLeft: 8 }}>›</span>
            </button>
          ))}
        </div>

        {/* 하단 힌트 */}
        <div style={{
          marginTop: 20,
          fontSize: 10,
          color: '#334155',
          fontFamily: 'monospace',
          letterSpacing: 2,
          textAlign: 'center',
          animation: 'choiceSlideUp 0.6s ease-out 0.8s both',
        }}>
          PRESS [1]·[2] TO CHOOSE
        </div>
      </div>
    </div>
  );
}
