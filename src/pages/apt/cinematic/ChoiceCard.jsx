/**
 * ChoiceCard — 분기 결정 카드. 1·2·3 키보드 단축키
 */
import { useEffect } from 'react';

export default function ChoiceCard({ choice, onSelect }) {
  useEffect(() => {
    const onKey = (e) => {
      const idx = parseInt(e.key, 10) - 1;
      if (!isNaN(idx) && choice?.options?.[idx]) onSelect(choice.options[idx]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choice, onSelect]);

  if (!choice) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.94) 100%)',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      animation: 'choiceBg 0.6s ease-out',
      zIndex: 30,
      fontFamily: '-apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes choiceBg { from { opacity: 0 } to { opacity: 1 } }
        @keyframes choiceUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes choicePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0) } 50% { box-shadow: 0 0 0 4px rgba(251,191,36,0.15) } }
      `}</style>

      <div style={{ maxWidth: 720, width: '90%', animation: 'choiceUp 0.7s ease-out' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 10, fontWeight: 700, color: '#fbbf24', letterSpacing: 6,
          marginBottom: 14, fontFamily: 'monospace',
        }}>
          <span style={{ width: 32, height: 1, background: '#fbbf24' }}/>
          DECISION POINT
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', animation: 'choicePulse 1.5s ease-in-out infinite' }}/>
        </div>

        <div style={{
          fontSize: 'clamp(20px, 2.6vw, 30px)',
          fontWeight: 200,
          color: '#fefefe',
          lineHeight: 1.35,
          marginBottom: 8,
          letterSpacing: -0.3,
          textShadow: '0 2px 16px rgba(0,0,0,0.95)',
          whiteSpace: 'pre-line',
        }}>{choice.prompt}</div>

        {choice.context && (
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 32, fontFamily: 'monospace', letterSpacing: 2 }}>
            {choice.context}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {choice.options.map((opt, i) => (
            <button
              key={opt.id || opt.next || i}
              onClick={() => onSelect(opt)}
              style={{
                background: 'rgba(15,23,42,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(100,116,139,0.35)',
                color: '#e2e8f0',
                padding: '16px 18px',
                borderRadius: 4,
                fontSize: 14, fontWeight: 400,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                animation: `choiceUp 0.6s ease-out ${0.3 + i * 0.12}s both`,
                fontFamily: '-apple-system, sans-serif',
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
              <span style={{
                width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(100,116,139,0.4)',
                borderRadius: 3,
                color: '#94a3b8',
                fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.4)',
                color: '#fbbf24',
                fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                padding: '3px 8px', borderRadius: 2,
                letterSpacing: 1, flexShrink: 0,
              }}>{opt.tag}</span>
              <span style={{ flex: 1, letterSpacing: 0.2 }}>{opt.label}</span>
              <span style={{ color: '#475569', fontSize: 18, marginLeft: 8 }}>›</span>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 20, fontSize: 10, color: '#334155', fontFamily: 'monospace',
          letterSpacing: 2, textAlign: 'center',
          animation: 'choiceUp 0.6s ease-out 0.8s both',
        }}>
          PRESS [{choice.options.map((_, i) => i + 1).join(']·[')}] TO CHOOSE
        </div>
      </div>
    </div>
  );
}
