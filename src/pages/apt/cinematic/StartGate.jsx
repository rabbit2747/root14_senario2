/**
 * StartGate — 오토플레이 정책 대응 + 시네마틱 인트로
 */
import { useEffect, useState } from 'react';

export default function StartGate({ scenario, onStart }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleStart(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const handleStart = () => { setExiting(true); setTimeout(onStart, 700); };

  return (
    <div
      onClick={handleStart}
      style={{
        position: 'fixed', inset: 0,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 1000,
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.7s ease-out',
        fontFamily: '-apple-system, sans-serif',
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes blink { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }
      `}</style>

      {/* 필름 그레인 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' /><feColorMatrix values=\'0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.12 0\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")',
        opacity: 0.7,
        pointerEvents: 'none',
      }}/>

      <div style={{ fontSize: 10, letterSpacing: 6, color: '#475569', fontFamily: 'monospace', marginBottom: 20, animation: 'fadeUp 0.8s 0.1s both' }}>
        APT CINEMATIC · CASE FILE
      </div>
      <div style={{ fontSize: 12, letterSpacing: 4, color: '#fbbf24', fontFamily: 'monospace', fontWeight: 700, marginBottom: 6, animation: 'fadeUp 0.8s 0.3s both' }}>
        ▎ {scenario.id.toUpperCase()}
      </div>
      <div style={{
        fontSize: 'clamp(28px, 5vw, 56px)',
        fontWeight: 200,
        color: '#fefefe',
        textAlign: 'center',
        maxWidth: '90%',
        lineHeight: 1.15,
        marginBottom: 12,
        letterSpacing: -0.5,
        animation: 'fadeUp 1.2s 0.5s both',
      }}>{scenario.title}</div>
      <div style={{
        fontSize: 'clamp(13px, 1.5vw, 16px)',
        color: '#94a3b8',
        textAlign: 'center', maxWidth: 600,
        lineHeight: 1.6, marginBottom: 56,
        fontStyle: 'italic',
        animation: 'fadeUp 1.2s 0.8s both',
      }}>{scenario.subtitle}</div>

      <div style={{
        display: 'flex', gap: 28,
        marginBottom: 56,
        fontSize: 10, color: '#475569', letterSpacing: 3, fontFamily: 'monospace',
        animation: 'fadeUp 1.2s 1.0s both',
      }}>
        <div><span style={{color:'#64748b'}}>VOICE</span>  1ST PERSON</div>
        <div><span style={{color:'#64748b'}}>ASPECT</span>  21:9</div>
        <div><span style={{color:'#64748b'}}>BRANCHES</span>  {Object.keys(scenario.choices||{}).length}</div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleStart(); }}
        style={{
          background: 'transparent',
          border: '1px solid #475569',
          color: '#fefefe',
          padding: '14px 36px',
          fontSize: 13, letterSpacing: 6, fontFamily: 'monospace', fontWeight: 600,
          cursor: 'pointer',
          animation: 'fadeUp 1.2s 1.2s both, blink 2s 2s ease-in-out infinite',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fbbf24'; e.currentTarget.style.color = '#fbbf24'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.color = '#fefefe'; }}
      >▶ PRESS PLAY</button>

      <div style={{ marginTop: 16, fontSize: 9, letterSpacing: 3, color: '#334155', fontFamily: 'monospace', animation: 'fadeUp 1.2s 1.4s both' }}>
        SPACE · ENTER · CLICK
      </div>
    </div>
  );
}
